import {
  HandlerArg,
  toolHandlers,
  ToolName,
  ToolPlan,
  ToolReturn,
} from "../types";
import { genAI } from "../llm/client";
import { Content } from "@google/genai";
import { toolDeclarations } from "../tools/tools";

export async function runWithFunctionCalling(
  userInput: string,
  history: Content[],
  plan: ToolPlan
): Promise<string> {
  //const plan: ToolPlan = await planToolCallWithReasoning(userInput, history);

  switch (plan.action) {
    case "clarify":
      return `I need more information: ${plan.missingInfo}\n\nReason: ${plan.reasoning}`;

    case "searchInternet": {
      // At the moment google only support one tool at a time. For this reason we need to split grounding and function call
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config: {
          tools: [
            {
              googleSearch: {},
            },
          ],
        },
      });
      return response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    }

    default: {
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: history,
        config: {
          tools: [
            {
              functionDeclarations: toolDeclarations,
            },
          ],
        },
      });

      const fn = response.functionCalls?.[0];
      if (fn && (fn.name as string) in toolHandlers) {
        const name = fn.name as ToolName;
        const args = fn.args as HandlerArg<typeof name>;
        const data = await executeTool(name, args);
        console.log(
          "the data returned by function call: " + fn + "is: " + data
        );
        const finalResponse = await genAI.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `You were given this propmt: ${
            history[0]
          } and you have found these results ${JSON.stringify(
            data
          )}. Now, respond to the user's query in a professional and friendly tone, like an assistant. 
          Focus only on the meaningful, user-relevant information. 
          Summarize clearly if needed, without omitting important facts. 
          Do NOT include any sensitive data, such as internal IDs, email addresses, system labels, or metadata unless it is directly relevant and necessary for understanding the user's question. 
          Only share what a typical end-user would find helpful or informative. Present the information in a concise, assistant-like tone.`,
        });
        return finalResponse.text ?? "";
      }

      return response.text ?? "";
    }
  }
}

async function executeTool<T extends ToolName>(
  name: T,
  args: HandlerArg<T>
): Promise<ToolReturn<T>> {
  // @ts-expect-error  (void tools receive undefined – acceptable)
  return toolHandlers[name](args);
}
