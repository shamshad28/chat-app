"use client";

import { useEffect, useRef } from "react";

const POPULAR_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥", "👏", "🎉", "🚀"];

export default function ReactionPicker({ onSelect, onClose, position = "top" }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute z-30 flex items-center gap-1 p-1.5 rounded-full bg-white border border-[#e9edef] shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
        position === "top" ? "-top-12 left-0" : "-bottom-12 left-0"
      }`}
    >
      {POPULAR_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(emoji);
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center text-lg rounded-full hover:bg-[#f0f2f5] hover:scale-125 transition-all duration-150 active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
