import { useState, useRef } from "react";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioFiles, setAudioFiles] = useState<{ id: string; file: File }[]>(
    []
  );
  const [recordedAudio, setRecordedAudio] = useState<{
    id: string;
    file: File;
  } | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const generateUniqueId = () => `${Date.now()}-${Math.random()}`;

  // Start recording
  const startRecording = async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setRecordedAudio({ id: generateUniqueId(), file });
        setAudioFiles((prev) => [...prev, { id: generateUniqueId(), file }]);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // Remove audio
  const handleRemoveAudio = (id: string) => {
    setAudioFiles((prev) => prev.filter((audio) => audio.id !== id));
  };

  // Add dropped audio files
  const addAudioFiles = (files: File[]) => {
    const validAudio = files.filter((file) => file.type.startsWith("audio/"));
    const newAudio = validAudio.map((file) => ({
      id: generateUniqueId(),
      file,
    }));
    setAudioFiles((prev) => [...prev, ...newAudio]);
  };

  return {
    isRecording,
    audioFiles,
    startRecording,
    recordedAudio,
    setRecordedAudio,
    stopRecording,
    handleRemoveAudio,
    addAudioFiles,
  };
};
