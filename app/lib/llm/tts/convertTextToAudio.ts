import { Buffer } from "buffer";
import { genAI } from "../client";
import { PassThrough } from "stream";
import wav from "wav";

export async function convertTextToAudio(text: string): Promise<Buffer | null> {
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Kore",
          },
        },
      },
    },
  });

  const base64Audio =
    response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    return null;
  }

  const pcmBuffer = Buffer.from(base64Audio, "base64");
  const wavBuffer = await convertPCMToWav(pcmBuffer);
  return wavBuffer;
}

/**
 * Wraps a raw PCM buffer into a WAV container
 */
function convertPCMToWav(pcmBuffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
    });

    const output = new PassThrough();
    const chunks: Buffer[] = [];

    output.on("data", (chunk) => chunks.push(chunk));
    output.on("end", () => resolve(Buffer.concat(chunks)));
    output.on("error", reject);

    writer.pipe(output);
    writer.end(pcmBuffer);
  });
}
