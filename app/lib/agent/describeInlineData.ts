// lib/agent/describeInlineData.ts
import { Content, Part } from "@google/genai";
import { genAI } from "../llm/client";

export async function describeInlineData(
  parts: Part[] | undefined
): Promise<string> {
  // 1️⃣ If no inlineData, just return the text
  if (!parts) {
    return "";
  }
  const first = parts[0];
  if (!parts.some((p) => p.inlineData) && first?.text) {
    return first.text.trim();
  }

  // 2️⃣ List all the multimodal parts
  const inlineParts = parts.filter((p) => p.inlineData);
  const list = inlineParts
    .map((p, i) => {
      const { mimeType, data } = p.inlineData!;
      const kind = mimeType?.startsWith("image/") ? "image" : "audio";
      const sizeKB = Math.round((data?.length ?? 0 * 3) / 4 / 1024);
      return `• Part ${i + 1}: ${kind} (${mimeType}, ≈${sizeKB} KB)`;
    })
    .join("\n");

  // 3️⃣ Build the description prompt
  const prompt = `
I received the following multimedia inputs:
${list}

Please describe each one in detail:
- For images: what you “see” (objects, colors, text, scene).
- For audio: what you “hear” (speech content, music, ambient sounds).

Respond with one description per part, prefixed by “Part 1:”, “Part 2:”, etc.
  `.trim();

  // 4️⃣ Send the prompt + the raw inlineData parts to Gemini
  const content: Content = {
    role: "user",
    parts: [
      { text: prompt },
      ...inlineParts.map((p) => ({ inlineData: p.inlineData! })),
    ],
  };

  const response = await genAI.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [content],
    config: { temperature: 0.2 },
  });

  // 5️⃣ Return the LLM’s description (or empty string)
  return response.text ?? "";
}
