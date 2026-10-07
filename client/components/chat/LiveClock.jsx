"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function LiveClock({ showSeconds = true, className = "" }) {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 ${className}`}>
        <Clock className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-mono">--:--:--</span>
      </div>
    );
  }

  const timeString = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
  });

  const dateString = time.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      title={`Live System Time: ${time.toLocaleDateString()} ${timeString}`}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e9edef] text-[#54656f] text-xs shadow-xs select-none group transition-all hover:border-[#00a884]/40 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse" />
        <Clock className="w-3.5 h-3.5 text-[#008069] group-hover:rotate-45 transition-transform" />
      </div>

      <span className="font-mono font-medium tracking-tight text-[#111b21]">{timeString}</span>

      <span className="hidden sm:inline text-[#8696a0]">•</span>
      <span className="hidden sm:inline text-[11px] text-[#667781]">{dateString}</span>
    </div>
  );
}
