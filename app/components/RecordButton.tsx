"use client";

type Props = {
  isRecording: boolean;
  onClick: () => void;
};

export const RecordButton = ({ isRecording, onClick }: Props) => (
  <button
    type="button"
    onClick={onClick}
    className="p-2 rounded-full hover:bg-gray-100 transition"
    title={isRecording ? "Stop Recording" : "Start Recording"}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      id="Voice-Mail--Streamline-Sharp"
      height="24"
      width="24"
    >
      <desc>Voice Mail Streamline Icon: https://streamlinehq.com</desc>
      <g id="voice-mail--mic-audio-mike-music-microphone">
        <path
          id="Rectangle 19"
          fill="#C2B8DA"
          d="M7 2h10v9a5 5 0 0 1 -10 0V2Z"
          strokeWidth="1.5"
        ></path>
        <path
          id="Rectangle 18"
          stroke="#766CA8"
          d="M7 2h10v9a5 5 0 0 1 -10 0V2Z"
          strokeWidth="1.5"
        ></path>
        <path
          id="Vector 112"
          stroke="#766CA8"
          d="M3 11a9 9 0 1 0 18 0"
          strokeWidth="1.5"
        ></path>
        <path
          id="Vector 113"
          stroke="#766CA8"
          d="m12 20 0 3"
          strokeWidth="1.5"
        ></path>
      </g>
    </svg>
  </button>
);
