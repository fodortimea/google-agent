import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY ?? "";

if (!apiKey) {
  throw new Error("Google Gemini API key not found.");
}

// Create the Gemini client once and reuse it
export const genAI = new GoogleGenAI({apiKey});
// Create the Gemini client once and reuse it
// const genAI = new GoogleGenerativeAI(apiKey);

// export const model = genAI.getGenerativeModel({
//   model: "gemini-1.5-flash",
// });
