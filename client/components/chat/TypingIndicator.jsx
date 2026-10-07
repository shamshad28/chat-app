"use client";

export default function TypingIndicator({ typers = [] }) {
  if (!typers || typers.length === 0) return null;

  const names = typers.map((t) => t.name || t.username || "Someone").join(", ");
  const text = typers.length > 1 ? `${names} are typing...` : `${names} is typing...`;

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-1.5 my-1 max-w-fit rounded-xl bg-white border border-[#e9edef] text-[#667781] text-xs shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-bounce" />
      </div>
      <span className="font-medium text-[#111b21]">{text}</span>
    </div>
  );
}
