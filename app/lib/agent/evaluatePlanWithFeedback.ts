import { supabase } from "../db/supabaseClient";
import { genAI } from "../llm/client";
import { embed } from "../llm/embedding";
import { isFunctionCallPlan, planSchema, ToolPlan } from "../types";

// adjust these knobs as you like
const MAX_FEEDBACK = 5;

/** A single feedback item we’ll retrieve */
type FeedbackEntry = {
  action: string;
  rating: number;
  comment: string;
  summary: string;
  similarity: number;
};

/**
 * RAG + LLM reflection: given the userPrompt and the agent's original plan,
 * retrieve similar feedback, then ask Gemini if the plan still stands.
 */
export async function reflectPlanWithFeedback(
  userPrompt: string,
  originalPlan: ToolPlan
): Promise<ToolPlan> {
  // 1️⃣ embed the prompt
  const qVec = await embed(userPrompt);

  // 2️⃣ fetch up to MAX_FEEDBACK similar feedback entries
  const { data, error } = await supabase.rpc("match_feedback_by_prompt", {
    query_embedding: qVec,
    k: MAX_FEEDBACK,
  });

  if (error || !data?.length || originalPlan.action === "clarify") {
    return originalPlan; // nothing to reflect on
  }

  const feedbacks = data as FeedbackEntry[];

  // 3️⃣ build a context string summarizing the feedback
  const feedbackContext = feedbacks
    .map(
      ({ action, rating, comment, summary, similarity }) =>
        `— Past action "${action}" (sim=${similarity.toFixed(
          2
        )}), rating=${rating}\n  "${comment || summary}"`
    )
    .join("\n");

  // 4️⃣ craft a reflection prompt
  const reflectionPrompt = `
You are an agent that just planned to run:

  Action: ${originalPlan.action}
  Params: ${JSON.stringify(
    isFunctionCallPlan(originalPlan) ? originalPlan.params : {}
  )}

A user said: "${userPrompt}".
Here are similar past interactions and their feedback:
${feedbackContext}

Question: Based on the above, is "${originalPlan.action}" still the best action?
If yes, reply with the same plan. If not, choose a different action (from the tool list) or ask for clarification.

Return valid JSON matching the schema:
{
  "action":  /* tool name, "searchInternet" or "clarify" */,
  "params":  /* optional object */,
  "reasoning": "Explain your decision"
}
`.trim();

  // 5️⃣ call Gemini with a JSON response schema
  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: reflectionPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
    },
  });

  // 6️⃣ parse out the JSON
  const text = response.text!;
  const start = text.indexOf("{");
  const parsedPlan = JSON.parse(text.slice(start)) as ToolPlan;
  let reflectedPlan = parsedPlan;

  if (parsedPlan.action !== originalPlan.action) {
    reflectedPlan = await chooseBestPlan(userPrompt, originalPlan, parsedPlan);
  }
  return reflectedPlan;
}

/**
 * Given the user's original prompt, and two competing plans,
 * ask Gemini to choose which plan is better (or ask for clarification).
 */
export async function chooseBestPlan(
  userPrompt: string,
  planA: ToolPlan,
  planB: ToolPlan
): Promise<ToolPlan> {
  const prompt = `
  User asked: "${userPrompt}"
  
  I have two possible plans:
  
  Plan A:
  ${JSON.stringify(planA, null, 2)}
  
  Plan B:
  ${JSON.stringify(planB, null, 2)}
  
  Which plan should I run?  Reply with **only** valid JSON matching the ToolPlan schema:
  {
    "action": "...",
    "params": { ... }  // or omitted if not needed
    "reasoning": "Explain why you picked A or B"
  }
    `.trim();

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: planSchema,
    },
  });

  const raw = response.text!;
  const start = raw.indexOf("{");
  return JSON.parse(raw.slice(start)) as ToolPlan;
}
