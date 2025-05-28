// lib/agent/describeInlineData.ts
import { Content, Part } from "@google/genai";
import { genAI } from "../llm/client";

export async function describeInlineData(
  parts: Part[] | undefined
): Promise<string> {
  // If no inlineData, just return the text
  if (!parts) {
    return "";
  }
  const first = parts[0];
  if (!parts.some((p) => p.inlineData) && first?.text) {
    return first.text.trim();
  }

  // List all the multimodal parts
  const inlineParts = parts.filter((p) => p.inlineData);
  const list = inlineParts
    .map((p, i) => {
      const { mimeType, data } = p.inlineData!;
      const kind = mimeType?.startsWith("image/") ? "image" : "audio";
      const sizeKB = Math.round((data?.length ?? 0 * 3) / 4 / 1024);
      return `• Part ${i + 1}: ${kind} (${mimeType}, ≈${sizeKB} KB)`;
    })
    .join("\n");

  // Build the description prompt
  const prompt = `
I received the following multimedia inputs:
${list}

Please follow for each one:
- For images: describe in detail what you “see” (objects, colors, text, scene).
- For audio: write down exactly what you “hear” - just the speech content. Music or ambient sounds should be described only if it has revelance to the user's request.

Respond with one description per part, prefixed by “Part 1:”, “Part 2:”, etc.
  `.trim();

  // Send the prompt + the raw inlineData parts to Gemini
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

  //  Return the LLM’s description (or empty string)
  return response.text ?? "";
}
