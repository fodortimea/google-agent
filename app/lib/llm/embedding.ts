import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY ?? "";

if (!apiKey) {
  throw new Error("Google Gemini API key not found.");
}

const ai = new GoogleGenAI({ apiKey });

/** Returns a raw float array you can store in pgvector */
export async function embed(text: string): Promise<number[] | undefined> {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-exp-03-07",
    contents: text,
  });
  return result.embeddings?.[0]?.values;
}
