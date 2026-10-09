"use client";

import { useState } from "react";
import { Minus, Square, X } from "lucide-react";

export default function WhatsAppTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMinimize = () => {
    // Simulated desktop minimize
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    // Simulated desktop close
  };

  return (
    <div className="h-[34px] min-h-[34px] bg-[#202c33] border-b border-[#222e35] flex items-center justify-between px-3 select-none z-50 text-[#aebac1]">
      {/* Left: WhatsApp Green Brand Icon & Title */}
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="currentColor"
          className="text-[#25d366]"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2M12.04 20.15C10.56 20.15 9.11 19.76 7.84 19.01L7.54 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.04 3.67C16.58 3.67 20.28 7.37 20.28 11.91C20.28 16.46 16.58 20.15 12.04 20.15Z" />
        </svg>
        <span className="text-xs font-normal text-[#d1d7db] tracking-wide">
          WhatsApp
        </span>
      </div>

      {/* Right: Windows Desktop Window Controls */}
      <div className="flex items-center -mr-3 h-full">
        <button
          type="button"
          onClick={handleMinimize}
          title="Minimize"
          className="w-11 h-[34px] flex items-center justify-center text-[#aebac1] hover:bg-[#374248] transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
          className="w-11 h-[34px] flex items-center justify-center text-[#aebac1] hover:bg-[#374248] transition-colors"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={handleClose}
          title="Close"
          className="w-11 h-[34px] flex items-center justify-center text-[#aebac1] hover:bg-[#e81123] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
