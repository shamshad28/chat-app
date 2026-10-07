"use client";

import { use } from "react";
import useAuth from "../../../hooks/useAuth";
import ChatLayout from "../../../components/chat/chatLayout";
import { Loader2 } from "lucide-react";

export default function ConversationPage({ params }) {
  const unwrappedParams = use(params);
  const { user, loading } = useAuth(true);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-violet-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <ChatLayout initialConversationId={unwrappedParams.conversationId} />;
}