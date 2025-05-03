// components/FeedbackButton.tsx
"use client";
import { useState, useEffect, useCallback } from "react";

export function FeedbackButton({
  interactionId,
  onOpen,
}: {
  interactionId: number | null;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(0);
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
        className="text-xs underline disabled:opacity-40"
        disabled={!interactionId}
      >
        Give feedback
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="relative bg-white p-6 rounded-xl shadow-xl space-y-4 max-w-sm w-full">
            {/* ✕ close icon */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-black"
              aria-label="Close"
            >
              &times;
            </button>

            <h3 className="font-semibold">Rate this answer</h3>

            {/* rating */}
            <select
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
              className="border rounded p-1"
            >
              <option value={0}>— select —</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>

            {/* comment */}
            <textarea
              className="w-full border rounded p-2"
              rows={3}
              placeholder="Optional comments"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            {/* submit */}
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-40"
              disabled={!rating}
              onClick={submit}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
