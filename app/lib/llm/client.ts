import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY ?? "";

if (!apiKey) {
  throw new Error("Google Gemini API key not found.");
}

export const genAI = new GoogleGenAI({apiKey});
