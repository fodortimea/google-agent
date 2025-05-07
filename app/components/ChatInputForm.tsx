import { FeedbackButton } from "./FeedbackButton";
import FilePreview from "./FilePreview";

type Props = {
  message: string;
  setMessage: (value: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
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
      <FilePreview files={images} onRemove={handleRemoveImage} />
      <FilePreview files={audio} onRemove={handleRemoveAudio} />
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
      {showFeedbackReminder && currentSavedDecisionId && (
        <div className="mt-2 text-xs text-gray-600 italic animate-pulse">
          💬 The model is not sure of the answer being what you wanted. Please
          give feedback.
        </div>
      )}
    </div>
  </form>
);

export default ChatInputForm;
