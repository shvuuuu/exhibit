import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { BetaMessageParam, BetaTool, BetaToolResultBlockParam, BetaToolUseBlock } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { z } from "zod";
import { AI_MODEL } from "../../config";
import { systemPrompt, userPrompt } from "../prompt";
import { executeTool, TOOLS, type ToolContext } from "../tools";

const MAX_TURNS = 14;

function toolDefs(): BetaTool[] {
  return TOOLS.map((t) => {
    const schema = z.toJSONSchema(t.schema) as Record<string, unknown>;
    delete schema.$schema;
    return {
      name: t.name,
      description: t.description,
      input_schema: schema as BetaTool["input_schema"],
      // The brief is the one large input; stream it as it is generated. We validate it with zod.
      ...(t.name === "file_case_brief" ? { eager_input_streaming: true } : {}),
    };
  });
}

/** Claude API provider: a streaming tool-use loop with adaptive thinking and server-side refusal fallback. */
export async function runWithAnthropic(ctx: ToolContext): Promise<{ usage: { input_tokens: number; output_tokens: number } }> {
  const client = new Anthropic();
  const tools = toolDefs();
  const messages: BetaMessageParam[] = [{ role: "user", content: userPrompt(ctx.disputeId) }];
  const usage = { input_tokens: 0, output_tokens: 0 };
  let nudged = false;
  let parseRetries = 0;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = client.beta.messages.stream({
      model: AI_MODEL,
      max_tokens: 32000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive", display: "summarized" },
      output_config: { effort: "medium" },
      system: [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }],
      tools,
      messages,
    });
    stream.on("thinking", (delta) => ctx.emit({ t: "thinking", text: delta }));
    stream.on("text", (delta) => ctx.emit({ t: "text", text: delta }));

    let msg;
    try {
      msg = await stream.finalMessage();
      parseRetries = 0;
    } catch (err) {
      // With eager input streaming a malformed tool input rejects finalMessage(); re-issue the turn.
      if (err instanceof Anthropic.APIError || parseRetries++ >= 2) throw err;
      continue;
    }
    usage.input_tokens += msg.usage.input_tokens + (msg.usage.cache_read_input_tokens ?? 0) + (msg.usage.cache_creation_input_tokens ?? 0);
    usage.output_tokens += msg.usage.output_tokens;

    if (msg.stop_reason === "refusal") throw new Error("The model declined this request.");
    messages.push({ role: "assistant", content: msg.content });

    const toolUses = msg.content.filter((b): b is BetaToolUseBlock => b.type === "tool_use");
    if (!toolUses.length) {
      if (ctx.brief) break;
      if (nudged) throw new Error("The agent stopped without filing a case brief.");
      nudged = true;
      messages.push({ role: "user", content: "File your conclusion now with the file_case_brief tool." });
      continue;
    }
    if (msg.stop_reason === "max_tokens") throw new Error("A tool call was cut off at max_tokens.");

    const results = await Promise.all(toolUses.map((tu) => executeTool(tu.name, tu.input, ctx, tu.id)));
    const content: BetaToolResultBlockParam[] = toolUses.map((tu, i) => ({ type: "tool_result", tool_use_id: tu.id, content: results[i].text, is_error: results[i].isError }));
    messages.push({ role: "user", content });
    if (ctx.brief) break;
  }
  if (!ctx.brief) throw new Error("The agent ran out of turns before filing a case brief.");
  return { usage };
}
