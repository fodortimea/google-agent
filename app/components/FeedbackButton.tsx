// components/FeedbackButton.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { StarIcon } from "./SarIcon";
import { SendIcon } from "./SendIcon";

export function FeedbackButton({
  interactionId,
  onOpen,
}: {
  interactionId: number | null;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const submit = useCallback(async () => {
    if (!interactionId) return; // guard: shouldn’t happen
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interactionId, rating, comment }),
    });
    setOpen(false);
    setRating(0);
    setComment("");
  }, [interactionId, rating, comment]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => {
          if (interactionId) {
            setOpen(true);
            onOpen?.();
          }
        }}
        className={`p-2 rounded-full transition ${!interactionId} ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
        disabled={!interactionId}
        title="Feedback"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="-0.855 -0.855 24 24"
          id="User-Feedback-Heart--Streamline-Flex"
          height="24"
          width="24"
        >
          <desc>
            User Feedback Heart Streamline Icon: https://streamlinehq.com
          </desc>
          <g id="user-feedback-heart">
            <path
              id="Union"
              fill="#C2B8DA"
              d="M11.144761178571429 15.158537399999998c-1.4541040714285713 -0.8762676642857143 -3.8619494785714283 -2.461516542857143 -3.8619494785714283 -4.438480328571428 0 -1.2867220928571428 1.0430923928571427 -2.3298144857142855 2.3298144857142855 -2.3298144857142855 0.5865931928571428 0 1.122556242857143 0.21677024999999997 1.5321349928571428 0.5746043571428571 0.4095946714285714 -0.3578341071428571 0.9455417999999999 -0.5746043571428571 1.5321349928571428 -0.5746043571428571 1.2867220928571428 0 2.329830407142857 1.0430923928571427 2.329830407142857 2.3298144857142855 0 1.9769637857142857 -2.4078454071428568 3.5622126642857137 -3.8619654 4.438480328571428Z"
              strokeWidth="1.71"
            ></path>
            <path
              id="Union_2"
              stroke="#766CA8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.144761178571429 15.158537399999998c-1.4541040714285713 -0.8762676642857143 -3.8619494785714283 -2.461516542857143 -3.8619494785714283 -4.438480328571428 0 -1.2867220928571428 1.0430923928571427 -2.3298144857142855 2.3298144857142855 -2.3298144857142855 0.5865931928571428 0 1.122556242857143 0.21677024999999997 1.5321349928571428 0.5746043571428571 0.4095946714285714 -0.3578341071428571 0.9455417999999999 -0.5746043571428571 1.5321349928571428 -0.5746043571428571 1.2867220928571428 0 2.329830407142857 1.0430923928571427 2.329830407142857 2.3298144857142855 0 1.9769637857142857 -2.4078454071428568 3.5622126642857137 -3.8619654 4.438480328571428Z"
              strokeWidth="1.71"
            ></path>
            <path
              id="Vector"
              stroke="#766CA8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.292741214285712 15.334867221428569c-0.20904835714285713 1.181226707142857 0.09632464285714284 2.209750992857143 0.9158005714285715 3.0857479928571427 1.18137 0.20904835714285713 2.2098942857142854 -0.09632464285714284 3.085732071428571 -0.9158005714285715"
              strokeWidth="1.71"
            ></path>
            <path
              id="Vector_2"
              stroke="#766CA8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.9610375357142855 6.96038685c0.20842742142857143 -1.1780424214285714 -0.09603805714285714 -2.2038600642857142 -0.9134123571428571 -3.0774210857142856 -1.1780264999999999 -0.20844334285714286 -2.203844142857143 0.09602213571428571 -3.0774131249999996 0.9133964357142857"
              strokeWidth="1.71"
            ></path>
            <path
              id="Vector_3"
              stroke="#766CA8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.731595285714285 20.595163928571427c-0.8002906071428572 0.15220885714285715 -1.6633275642857142 0.22958699999999999 -2.5865634428571425 0.22958699999999999 -6.19494825 0 -9.679607635714286 -3.4847230714285713 -9.679607635714286 -9.679623557142857 0 -3.1169858357142854 0.8821745142857143 -5.547853628571428 2.5479062142857143 -7.193922364285714"
              strokeWidth="1.71"
            ></path>
            <path
              id="Vector_4"
              stroke="#766CA8"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.6743764 1.6735968857142858c0.7675243071428571 -0.13804674642857143 1.5917925857142856 -0.20817267857142857 2.4706076785714286 -0.20817267857142857 6.194884564285714 0 9.679607635714286 3.4846593857142856 9.679607635714286 9.679607635714286 0 3.1208865857142856 -0.8844353571428571 5.553999299999999 -2.5541155714285715 7.2001158"
              strokeWidth="1.71"
            ></path>
          </g>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="relative bg-white py-5 px-5 rounded-2xl shadow-xl space-y-4 max-w-sm w-full border border-accent">
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-black text-xl"
              aria-label="Close"
            >
              &times;
            </button>

            <h3 className="font-semibold text-lg text-gray-800 text-center mt-2">
              Rate this answer
            </h3>

            {/* Stars */}
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <StarIcon filled={n <= (hoverRating || rating)} />
                </button>
              ))}
            </div>

            {/* Textarea + send icon */}
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please write your feedback here..."
                rows={3}
                className="w-full resize-none bg-transparent border border-[#D7E0FF] rounded-2xl py-3 px-4 pr-12 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary max-h-32 overflow-y-auto text-primary dark:text-dark-primary"
              />

              <button
                onClick={submit}
                disabled={!rating}
                className="absolute top-2/3 right-3 -translate-y-[45%] text-primary dark:text-dark-primary hover:text-blue-700"
              >
                <SendIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
