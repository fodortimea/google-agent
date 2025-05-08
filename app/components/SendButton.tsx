"use client";

import { SendIcon } from "./SendIcon";

export const SendButton = () => (
  <button
    type="submit"
    className="p-2 rounded-full hover:bg-gray-100 transition"
    title="Send"
  >    
  <SendIcon />
  </button>
);
