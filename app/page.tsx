"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { Content, Part } from "@google/genai";
import { FeedbackButton } from "./components/FeedbackButton";

async function convertBlobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Content[]>([
    { role: "model", parts: [{ text: "Hi. How can I help?" }] },
  ]);
  const [images, setImages] = useState<{ id: string; file: File }[]>([]);
  const [audio, setAudio] = useState<{ id: string; file: File }[]>([]);
  const [showFeedbackReminder, setShowFeedbackReminder] = useState(false);
  const [currentSavedDecisionId, setCurrentSavedDecisionId] = useState<
    number | null
  >(null);

  const {
    isRecording,
    audioFiles,
    startRecording,
    recordedAudio,
    setRecordedAudio,
    stopRecording,
  } = useAudioRecorder();

  const generateUniqueId = () => `${Date.now()}-${Math.random()}`;
  const handleFeedbackOpened = () => setShowFeedbackReminder(false);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      const hasText = message.trim().length > 0;
      const hasImages = images.length > 0;
      const hasAudio = audio.length > 0;

      if ((!hasText && hasImages) || (!hasText && !hasImages && !hasAudio)) {
        console.warn(
          "Invalid submission: Images need text, or nothing to send."
        );
        return;
      }

      const parts: Part[] = [];
      if (hasText) {
        parts.push({ text: message });
      }

      if (hasImages) {
        const imageParts = await Promise.all(
          images.map(async (image) => {
            const base64Data = await convertBlobToBase64(image.file);
            return {
              inlineData: {
                data: base64Data,
                mimeType: image.file.type || "image/png",
              },
            } as Part;
          })
        );
        parts.push(...imageParts);
      }

      if (hasAudio) {
        const audioParts = await Promise.all(
          audio.map(async (audioFile) => {
            const base64Data = await convertBlobToBase64(audioFile.file);
            return {
              inlineData: {
                data: base64Data,
                mimeType: audioFile.file.type || "audio/mp3",
              },
            } as Part;
          })
        );
        parts.push(...audioParts);
      }

      const userMessage: Content = { role: "user", parts };
      setCurrentSavedDecisionId(null);

      const formData = new FormData();
      formData.append("messages", JSON.stringify(chatMessages.slice(1))); // Previous messagess
      formData.append("message", JSON.stringify(userMessage)); // New user message

      setChatMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setImages([]);
      setAudio([]);

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          body: formData,
        });

        if (!response.ok)
          throw new Error("Failed to communicate with the server");

        const data = await response.json();
        setCurrentSavedDecisionId(data.interactionId);
        setShowFeedbackReminder(data.requestFeedback);
        console.log("The data to be written in the chat is: " + data.result);
        setChatMessages((prev) => [
          ...prev,
          { role: "model", parts: [{ text: data.result }] },
        ]);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [message, images, audio, chatMessages]
  );

  useEffect(() => {
    if (recordedAudio) {
      setAudio([recordedAudio]);
      setRecordedAudio(null);
    }
  }, [recordedAudio, setRecordedAudio]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validImages = files.filter((file) => file.type.startsWith("image/"));
    const validAudio = files.filter((file) => file.type.startsWith("audio/"));
    const newImages = validImages.map((file) => ({
      id: generateUniqueId(),
      file,
    }));
    const newAudio = validAudio.map((file) => ({
      id: generateUniqueId(),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
    setAudio((prev) => [...prev, ...newAudio]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((image) => image.id !== id));
  };

  const handleStopRecording = async () => {
    stopRecording();
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure state update

    if (audioFiles.length > 0) {
      const lastAudioFile = audioFiles[audioFiles.length - 1];
      setRecordedAudio({ id: generateUniqueId(), file: lastAudioFile.file }); // Store only the last recorded audio
    }
  };

  // Remove audio
  const handleRemoveAudio = (id: string) => {
    setAudio((prev) => prev.filter((audio) => audio.id !== id));
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <div
        className="flex-1 w-full max-w-3xl bg-white rounded shadow p-4 mb-4 overflow-auto"
        style={{ maxHeight: "70vh" }}
      >
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-4 rounded-lg max-w-xs shadow ${
                msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {msg.parts?.map((part, partIndex) => (
                <div key={partIndex}>
                  {/* Text Messages */}
                  {part.text && <p>{part.text}</p>}

                  {/* Images */}
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

                  {/* Audio */}
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
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded shadow p-4"
      >
        <div
          className="relative w-full border rounded p-4 mb-2 bg-gray-50 h-32 flex flex-wrap gap-2"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message or drop files here..."
            className="flex-1 h-full bg-transparent border-none resize-none focus:outline-none"
          />
          {images.map((image) => (
            <div key={image.id} className="relative">
              <div className="w-10 h-10 object-cover rounded border overflow-hidden">
                <Image
                  src={URL.createObjectURL(image.file)}
                  alt="Preview"
                  width={40}
                  height={40}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-0 right-0 text-white bg-black/50 rounded-full w-4 h-4 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          ))}
          {audio.map((audioFile) => (
            <div key={audioFile.id} className="relative flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                🎵
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAudio(audioFile.id)}
                className="absolute top-0 right-0 text-white bg-black/50 rounded-full w-4 h-4 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : startRecording}
            className={`py-2 px-4 rounded ${
              isRecording ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Send
          </button>
          <FeedbackButton
            interactionId={currentSavedDecisionId}
            onOpen={handleFeedbackOpened}
          />
          {/* ←– new reminder, only if there’s a recent interaction and we haven’t yet hidden it */}
          {showFeedbackReminder && currentSavedDecisionId && (
            <div className="mt-2 text-xs text-gray-600 italic animate-pulse">
              💬 The model is not sure of the answer being what you wanted.
              Please give feedback.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
