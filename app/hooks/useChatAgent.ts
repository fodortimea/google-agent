"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { Content, Part } from "@google/genai";

/**
 * Encapsulates all chat state and handlers:
 * - message, chatMessages, images, audio
 * - feedback reminder
 * - drag/drop, previews, recording, submission
 */
export function useChatAgent() {
  const [message, setMessage] = useState("");
  const initialContent: Content = {
    role: "model",
    parts: [{ text: "Hi. How can I help?" }],
  };
  const [chatMessages, setChatMessages] = useState<Content[]>([initialContent]);
  const [images, setImages] = useState<{ id: string; file: File }[]>([]);
  const [audio, setAudio] = useState<{ id: string; file: File }[]>([]);
  const [showFeedbackReminder, setShowFeedbackReminder] = useState(false);
  const [currentSavedDecisionId, setCurrentSavedDecisionId] = useState<
    number | null
  >(null);
  const latestAudioRef = useRef<{ id: string; file: File } | null>(null);

  const audioRecorder = useAudioRecorder();
  const {
    isRecording,
    startRecording,
    recordedAudio,
    setRecordedAudio,
    stopRecording,
  } = audioRecorder;

  // Helpers
  const generateUniqueId = () => `${Date.now()}-${Math.random()}`;
  async function convertBlobToBase64(blob: Blob): Promise<string> {
    const buffer = await blob.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  }

  // Clear feedback reminder when opening form
  const handleFeedbackOpened = () => setShowFeedbackReminder(false);

  // Submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const hasText = message.trim().length > 0;
      const hasImages = images.length > 0;
      if (
        (!hasText && hasImages) ||
        (!hasText && !hasImages && !latestAudioRef.current)
      ) {
        console.warn(
          "Invalid submission: Images need text, or nothing to send."
        );
        return;
      }
      // Build parts array
      const parts: Part[] = [];
      if (hasText) parts.push({ text: message.trim() });
      if (hasImages) {
        const imageParts = await Promise.all(
          images.map(
            async (img) =>
              ({
                inlineData: {
                  data: await convertBlobToBase64(img.file),
                  mimeType: img.file.type || "image/png",
                },
              } as Part)
          )
        );
        parts.push(...imageParts);
      }
      if (latestAudioRef.current) {
        const aud = latestAudioRef.current;
        const audioPart: Part = {
          inlineData: {
            data: await convertBlobToBase64(aud.file),
            mimeType: aud.file.type || "audio/mp3",
          },
        };
        parts.push(audioPart);
      }
      const userMessage: Content = { role: "user", parts };
      setCurrentSavedDecisionId(null);
      const formData = new FormData();
      const newHistory: string = sessionStorage.getItem("chatMessages") || "[]";
      formData.append("message", JSON.stringify(userMessage));
      formData.append("history", newHistory);

      setChatMessages((prev) => [...prev, userMessage]);
      setMessage("");
      setImages([]);
      setAudio([]);
      try {
        console.log("Entering route");
        const response = await fetch("/api/agent", {
          method: "POST",
          body: formData,
        });
        console.log("Response.ok is:", response.ok);
        if (!response.ok)
          throw new Error("Failed to communicate with the server");
        const data = await response.json();
        console.log("data is:", JSON.stringify(data));
        setCurrentSavedDecisionId(data.interactionId);
        setShowFeedbackReminder(data.requestFeedback);
        setChatMessages((prev) => [...prev, data.result as Content]);
        sessionStorage.setItem(
          "chatMessages",
          JSON.stringify(data.sessionHistory)
        );
      } catch (err) {
        console.error("Error:", err);
      }
    },
    [message, images, audio, chatMessages]
  );

  useEffect(() => {
    if (recordedAudio) {
      const newAudio = { id: generateUniqueId(), file: recordedAudio.file };
      latestAudioRef.current = newAudio;
      setAudio([newAudio]); // For UI
      setRecordedAudio(null); // Reset state
    }
  }, [recordedAudio, setRecordedAudio]);

  useEffect(() => {
    // Initialize chat messages from session storage on every reload.
    const initial = JSON.stringify([initialContent]);
    sessionStorage.setItem("chatMessages", initial);
  }, []);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validImages = files.filter((f) => f.type.startsWith("image/"));
    const validAudio = files.filter((f) => f.type.startsWith("audio/"));
    setImages((prev) => [
      ...prev,
      ...validImages.map((f) => ({ id: generateUniqueId(), file: f })),
    ]);
    setAudio((prev) => [
      ...prev,
      ...validAudio.map((f) => ({ id: generateUniqueId(), file: f })),
    ]);
  };

  const handleRemoveImage = (id: string) =>
    setImages((prev) => prev.filter((i) => i.id !== id));
  const handleRemoveAudio = (id: string) =>
    setAudio((prev) => prev.filter((a) => a.id !== id));
  const handleStopRecording = async () => {
    stopRecording();
  };

  return {
    // state
    message,
    setMessage,
    chatMessages,
    images,
    audio,
    showFeedbackReminder,
    currentSavedDecisionId,
    isRecording,
    // handlers
    startRecording,
    handleStopRecording,
    handleDragOver,
    handleDrop,
    handleRemoveImage,
    handleRemoveAudio,
    handleSubmit,
    handleFeedbackOpened,
  };
}
