import { Part } from "@google/genai";
import Image from "next/image";

const MessageBubble = ({
  role,
  parts,
}: {
  role: string | undefined;
  parts: Part[] | undefined;
}) => {
  const isUser = role === "user";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-md
          ${
            isUser
              ? "bg-white text-primary dark:text-dark-primary border border-accent rounded-bl-none"
              : "bg-message text-white rounded-br-none"
          }
        `}
      >
        {parts?.map((part, i) => (
          <div key={i} className="mb-1 last:mb-0 break-words">
            {part.text && <p className="whitespace-pre-wrap">{part.text}</p>}

            {part.inlineData?.mimeType?.startsWith("image/") && (
              <div className="my-2 rounded overflow-hidden max-w-full">
                <Image
                  src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                  alt="Uploaded"
                  width={300}
                  height={300}
                  className="rounded-xl"
                />
              </div>
            )}

            {part.inlineData?.mimeType?.startsWith("audio/") && (
              <div className="my-2 min-w-[200px]">
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
};

export default MessageBubble;
