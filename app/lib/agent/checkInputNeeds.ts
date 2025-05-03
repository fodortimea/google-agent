import { Type } from "@google/genai";
import { genAI } from "../llm/client";

export async function checkInputNeeds(input: string) {
  const prompt = `
You are a helpful assistant that checks if a user's request contains enough information to act on it.
Analyze this input:
"${input}"

If it's complete, reply:
{ "isComplete": true, "reasoning": "..." }

If not, reply:
{ "isComplete": false, "clarification": "What else you need?", "reasoning": "..." }

Examples:
- "Send an email to Alice" → incomplete (missing subject + body)
- "Schedule a meeting with John at 3PM" → complete
- "Find events" → incomplete (missing time frame)
      `.trim();

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isComplete: {
            type: Type.BOOLEAN,
            description: "is the user prompt defined well",
            nullable: false,
          },
          clarification: {
            type: Type.STRING,
            description: "What more information do I need from the user?",
            nullable: true,
          },
          reasoning: {
            type: Type.STRING,
            description: "What is the reasoning behind your decision?",
            nullable: false,
          },
        },

        required: ["isComplete", "reasoning"],
        propertyOrdering: ["isComplete", "clarification", "reasoning"],
      },
    },
  });
  const content = response.text ?? "{}";

  try {
    const start = content.indexOf("{");
    const parsed = JSON.parse(content.slice(start));
    return parsed;
  } catch (e) {
    console.log("Error was thrown: " + e);
    return {
      isComplete: false,
      clarification: "Sorry, I didn not understand that. Can you rephrase?",
      reasoning: "LLM response could not be parsed.",
    };
  }
}
