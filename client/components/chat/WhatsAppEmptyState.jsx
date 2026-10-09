"use client";

import { FileText, UserPlus, Lock } from "lucide-react";

export default function WhatsAppEmptyState({
  onSendDocument,
  onAddContact,
  onAskMetaAI,
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#111b21] text-[#e9edef] select-none p-6 relative">
      {/* Center 3 Action Buttons matching the user's WhatsApp desktop screenshot */}
      <div className="flex items-center justify-center gap-6 sm:gap-10">
        {/* 1. Send Document */}
        <button
          type="button"
          onClick={onSendDocument}
          className="group flex flex-col items-center gap-3 transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] border border-[#2a3942] flex items-center justify-center text-[#d1d7db] group-hover:text-white transition-all shadow-md">
            <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#8696a0] group-hover:text-[#e9edef] transition-colors">
            Send document
          </span>
        </button>

        {/* 2. Add Contact */}
        <button
          type="button"
          onClick={onAddContact}
          className="group flex flex-col items-center gap-3 transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] border border-[#2a3942] flex items-center justify-center text-[#d1d7db] group-hover:text-white transition-all shadow-md">
            <UserPlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#8696a0] group-hover:text-[#e9edef] transition-colors">
            Add contact
          </span>
        </button>

        {/* 3. Ask Meta AI (Purple Gradient Circle matching the screenshot) */}
        <button
          type="button"
          onClick={onAskMetaAI}
          className="group flex flex-col items-center gap-3 transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 group-hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.45)]">
            <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-purple-400 via-indigo-400 to-cyan-400 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111b21]" />
              </div>
            </div>
          </div>
          <span className="text-xs sm:text-sm font-medium text-[#8696a0] group-hover:text-[#c084fc] transition-colors">
            Ask Meta AI
          </span>
        </button>
      </div>

      {/* Subtle End-to-end encryption note at bottom */}
      <div className="absolute bottom-6 flex items-center gap-1.5 text-xs text-[#8696a0]/80">
        <Lock className="w-3.5 h-3.5" />
        <span>End-to-end encrypted</span>
      </div>
    </div>
  );
}
