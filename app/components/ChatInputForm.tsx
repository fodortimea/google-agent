import { FeedbackButton } from "./FeedbackButton";
import FilePreview from "./FilePreview";
import { RecordButton } from "./RecordButton";
import { SendButton } from "./SendButton";

type Props = {
  message: string;
  setMessage: (value: string) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  images: { id: string; file: File }[];
  audio: { id: string; file: File }[];
  handleRemoveImage: (id: string) => void;
  handleRemoveAudio: (id: string) => void;
  isRecording: boolean;
  startRecording: () => void;
  handleStopRecording: () => void;
  currentSavedDecisionId: number | null;
  handleFeedbackOpened: () => void;
  showFeedbackReminder: boolean;
};

const ChatInputForm = ({
  message,
  setMessage,
  handleSubmit,
  handleDragOver,
  handleDrop,
  images,
  audio,
  handleRemoveImage,
  handleRemoveAudio,
  isRecording,
  startRecording,
  handleStopRecording,
  currentSavedDecisionId,
  handleFeedbackOpened,
  showFeedbackReminder,
}: Props) => (
  <form onSubmit={handleSubmit} className="w-full max-w-3xl">
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative border rounded-2xl shadow-md bg-white p-4 mb-4 max-h-40 overflow-y-auto"
    >
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Type your message or drop images here..."
        className="w-full resize-none bg-transparent border-none focus:outline-none max-h-32 overflow-y-auto text-primary dark:text-dark-primary"
      />

      <div className="mt-2 flex gap-2 flex-wrap">
        <FilePreview files={images} onRemove={handleRemoveImage} />
        <FilePreview files={audio} onRemove={handleRemoveAudio} />
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2">
        {/* Record button */}
        <RecordButton
          isRecording={isRecording}
          onClick={isRecording ? handleStopRecording : startRecording}
        />
        <SendButton />
        <FeedbackButton
          interactionId={currentSavedDecisionId}
          onOpen={handleFeedbackOpened}
        />
      </div>
    </div>

    {/* Feedback reminder message */}
    {showFeedbackReminder && currentSavedDecisionId && (
      <div className="mt-1 text-xs text-gray-500 italic animate-pulse">
        💬 The model isn’t confident about the response. Please leave feedback.
      </div>
    )}
  </form>
);

export default ChatInputForm;
