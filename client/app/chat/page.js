"use client";

import useAuth from "../../hooks/useAuth";
import ChatLayout from "../../components/chat/chatLayout";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { user, loading } = useAuth(true);

  if (loading || !user) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-[#111b21] text-[#00a884]">
        <div className="w-14 h-14 rounded-full bg-[#202c33] flex items-center justify-center mb-4">
          <Loader2 className="w-7 h-7 animate-spin text-[#00a884]" />
        </div>
        <span className="text-xs text-[#8696a0] font-medium tracking-wide">WhatsApp Web</span>
      </div>
    );
  }

  return <ChatLayout />;
}