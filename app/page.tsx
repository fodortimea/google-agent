"use client";

import { useChatAgent } from "./hooks/useChatAgent";
import MessageBubble from "./components/MessageBubble";
import ChatInputForm from "./components/ChatInputForm";

export default function Home() {
  const {
    message,
    setMessage,
    chatMessages,
    images,
    audio,
    showFeedbackReminder,
    currentSavedDecisionId,
    isRecording,
    startRecording,
    handleStopRecording,
    handleDragOver,
    handleDrop,
    handleRemoveImage,
    handleRemoveAudio,
    handleSubmit,
    handleFeedbackOpened,
  } = useChatAgent();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-100">
      <div
        className="flex-1 w-full max-w-3xl bg-white rounded shadow p-4 mb-4 overflow-auto"
        style={{ maxHeight: "70vh" }}
      >
        {chatMessages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} parts={msg.parts} />
        ))}
      </div>

      <ChatInputForm
        message={message}
        setMessage={setMessage}
        handleSubmit={handleSubmit}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        images={images}
        audio={audio}
        handleRemoveImage={handleRemoveImage}
        handleRemoveAudio={handleRemoveAudio}
        isRecording={isRecording}
        startRecording={startRecording}
        handleStopRecording={handleStopRecording}
        currentSavedDecisionId={currentSavedDecisionId}
        handleFeedbackOpened={handleFeedbackOpened}
        showFeedbackReminder={showFeedbackReminder}
      />
    </div>
  );
}
