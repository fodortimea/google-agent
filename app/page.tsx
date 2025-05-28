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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 flex flex-col items-center w-full px-4 overflow-hidden">
        <div className="flex flex-col w-full max-w-3xl h-full">
          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto border rounded-2xl shadow-md bg-white p-4 mb-2">
            {chatMessages.map((msg, index) => (
              <MessageBubble key={index} role={msg.role} parts={msg.parts} />
            ))}
          </div>

          {/* Sticky input */}
          <div className="sticky bottom-0 w-full bg-gray-100 z-10">
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
        </div>
      </div>
    </div>
  );
}
