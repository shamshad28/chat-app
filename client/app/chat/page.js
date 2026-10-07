"use client";

import useAuth from "../../hooks/useAuth";
import ChatLayout from "../../components/chat/chatLayout";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { user, loading } = useAuth(true);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f0f2f5] text-[#008069]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <ChatLayout />;
}