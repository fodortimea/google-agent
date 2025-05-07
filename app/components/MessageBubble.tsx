import { Part } from "@google/genai";
import Image from "next/image";

const MessageBubble = ({
  role,
  parts,
}: {
  role: string | undefined;
  parts: Part[] | undefined;
}) => (
  <div
    className={`flex mb-4 ${role === "user" ? "justify-end" : "justify-start"}`}
  >
    <div
      className={`p-4 rounded-lg max-w-xs shadow ${
        role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      {parts?.map((part, i) => (
        <div key={i}>
          {part.text && <p>{part.text}</p>}

          {part.inlineData?.mimeType?.startsWith("image/") && (
            <div className="mb-2 rounded overflow-hidden max-w-full">
              <Image
                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                alt="Uploaded"
                width={300}
                height={300}
                className="rounded"
              />
            </div>
          )}

          {part.inlineData?.mimeType?.startsWith("audio/") && (
            <div className="mb-2 min-w-[200px]">
              <audio
                controls
                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                className="w-full"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default MessageBubble;
