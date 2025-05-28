import { Content } from "@google/genai";
import { genAI } from "../llm/client";
import { planSchema, ToolPlan } from "../types";
import { toolDeclarations } from "../tools/tools";

export async function planToolCallWithReasoning(
  userInput: string,
  history: Content[]
): Promise<ToolPlan> {
  const toolList = toolDeclarations
    .map((t) => `- ${t.name}: ${t.description}`)
    .join("\n");

  const prompt = `
You are an assistant planning which tool to use.

You must choose one of the following:
1. Use a tool from the list
2. Search the internet if grounding is needed
3. Ask for clarification if the input lacks necessary info

Available tools:
${toolList}
User input to respond to:
"${userInput}"

Base your decision *only* on the most recent user input, unless previous context is clearly related. Ignore old conversation turns unless they are explicitly relevant.

Reply in valid JSON.

Choose one of these formats:

🔹 Tool call:
{
  "action": "tool_name",
  "params": { ... },
  "reasoning": "Why this tool and these params"
}

🔹 Needs grounding:
{
  "action": "searchInternet",
  "query": "what to search for",
  "reasoning": "Why grounding is needed"
}

🔹 Needs clarification:
{
  "action": "clarify",
  "missingInfo": "What extra info you need",
  "reasoning": "Why you cannot continue without it"
}
`.trim();

  const extraTurn: Content = {
    role: "model",
    parts: [{ text: "I need to do my research..." }],
  };

  const planTurn: Content = {
    role: "user",
    parts: [{ text: prompt }],
  };

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [...history, extraTurn, planTurn],
    config: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
    },
  });
  const content = response.text ?? "{}";

  const start = content.indexOf("{");

  try {
    return JSON.parse(content.slice(start)) as ToolPlan;
  } catch (e) {
    throw new Error(
      "❌ Failed to parse Gemini planning response:\n" +
        content +
        "with exception" +
        e
    );
  }
}
