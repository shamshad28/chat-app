"use client";

import { useState, useMemo } from "react";
import ConversationItem from "./ConversationItem";
import useChatStore from "../../store/chatStore";
import { Search, Plus, Users, MessageSquarePlus, Loader2 } from "lucide-react";

export default function ConversationList({
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
}) {
  const [filterQuery, setFilterQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'direct' | 'group'

  const conversations = useChatStore((state) => state.conversations);
  const activeConversation = useChatStore((state) => state.activeConversation);
  const loadingConversations = useChatStore((state) => state.loadingConversations);

  const filteredConversations = useMemo(() => {
    return (conversations || []).filter((conv) => {
      // Tab filter
      if (activeTab === "direct" && conv.type !== "direct") return false;
      if (activeTab === "group" && conv.type !== "group") return false;

      // Query filter
      if (!filterQuery.trim()) return true;
      const q = filterQuery.toLowerCase();

      if (conv.type === "group") {
        return conv.name?.toLowerCase().includes(q);
      } else {
        return (conv.members || []).some(
          (m) =>
            m.name?.toLowerCase().includes(q) ||
            m.username?.toLowerCase().includes(q)
        );
      }
    });
  }, [conversations, activeTab, filterQuery]);

  return (
    <div className="flex flex-col h-full bg-white text-[#111b21] select-none">
      {/* Search Bar & Action Buttons */}
      <div className="p-3 space-y-2.5 border-b border-[#d1d7db] bg-white">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#54656f]" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#f0f2f5] text-xs placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884] text-[#111b21]"
          />
        </div>

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onOpenNewChat}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#e7fce3] hover:bg-[#d9fdd3] text-[#008069] border border-[#00a884]/20 text-xs font-medium transition-all active:scale-95"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewGroup}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#f0f2f5] hover:bg-[#e9edef] text-[#111b21] border border-[#e9edef] text-xs font-medium transition-all active:scale-95"
          >
            <Users className="w-3.5 h-3.5 text-[#54656f]" />
            <span>New Group</span>
          </button>
        </div>

        {/* WhatsApp Style Filter Pills */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {[
            { id: "all", label: "All" },
            { id: "direct", label: "Chats" },
            { id: "group", label: "Groups" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1 px-3 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#008069] text-white"
                  : "bg-[#f0f2f5] text-[#54656f] hover:bg-[#e9edef]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] bg-white">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#00a884]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs text-[#667781] mt-2">Loading chats...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-16 px-4 text-center text-[#667781]">
            <div className="w-12 h-12 rounded-full bg-[#f0f2f5] flex items-center justify-center mx-auto mb-2 text-xl">
              💬
            </div>
            <p className="text-sm font-medium text-[#111b21]">No chats found</p>
            <p className="text-xs text-[#667781] mt-1">
              {filterQuery ? "Try searching for another name or number" : "Click 'New Chat' to start messaging!"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation, idx) => (
            <ConversationItem
              key={`${conversation._id}-${idx}`}
              conversation={conversation}
              isSelected={activeConversation?._id === conversation._id}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
}
