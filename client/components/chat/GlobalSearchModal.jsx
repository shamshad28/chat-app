"use client";

import { useState, useEffect } from "react";
import { searchMessages } from "../../services/messageService";
import { formatConversationDate } from "../../lib/utils";
import { X, Search, Loader2, CornerDownRight } from "lucide-react";

export default function GlobalSearchModal({
  isOpen,
  onClose,
  activeConversationId,
  onSelectMessageResult,
}) {
  const [query, setQuery] = useState("");
  const [onlyCurrentChat, setOnlyCurrentChat] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await searchMessages(
          query.trim(),
          onlyCurrentChat ? activeConversationId : null
        );
        setResults(res.messages || []);
      } catch (err) {
        console.error("Search messages error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, query, onlyCurrentChat, activeConversationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white border border-[#e9edef] shadow-2xl overflow-hidden text-[#111b21] animate-in zoom-in-95 duration-150">
        {/* WhatsApp Signature Green Header */}
        <div className="flex items-center justify-between p-4 bg-[#008069] text-white">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-white" />
            <h2 className="text-base font-semibold">Search Messages</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input & Filter */}
        <div className="p-5 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search words, phrases, or messages..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f0f2f5] border border-[#e9edef] text-sm text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
              autoFocus
            />
          </div>

          {activeConversationId && (
            <label className="flex items-center gap-2 text-xs text-[#54656f] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyCurrentChat}
                onChange={(e) => setOnlyCurrentChat(e.target.checked)}
                className="rounded border-[#8696a0] text-[#008069] focus:ring-[#00a884]"
              />
              <span>Search only in this chat</span>
            </label>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto px-5 pb-5 space-y-2 scrollbar-thin">
          {loading ? (
            <div className="py-12 flex justify-center text-[#008069]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8696a0]">
              {query.trim()
                ? "No messages matching your search query."
                : "Type to search messages across your chats."}
            </div>
          ) : (
            results.map((msg, idx) => {
              const conv = msg.conversation;
              const convName =
                conv?.type === "group" ? conv.name : msg.sender?.name || "Chat";

              return (
                <div
                  key={`${msg._id}-${idx}`}
                  onClick={() => {
                    onSelectMessageResult(msg);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl bg-[#f0f2f5] hover:bg-[#e7fce3] border border-[#e9edef] hover:border-[#25d366]/40 cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center justify-between text-xs text-[#667781] mb-1.5">
                    <span className="font-semibold text-[#008069] truncate max-w-[200px]">
                      {convName}
                    </span>
                    <span>{formatConversationDate(msg.createdAt)}</span>
                  </div>

                  <p className="text-sm text-[#111b21] line-clamp-2 leading-relaxed">
                    <span className="font-semibold text-[#54656f] text-xs mr-1">
                      {msg.sender?.name}:
                    </span>
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-end mt-2 text-[11px] text-[#008069] font-medium gap-1">
                    <span>Jump to message</span>
                    <CornerDownRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
