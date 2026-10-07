"use client";

import { useEffect, useRef, useState, useLayoutEffect } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { formatDateDivider } from "../../lib/utils";
import { ArrowDown, Loader2, X } from "lucide-react";

export default function MessageList({
  messages = [],
  currentUser,
  isGroup = false,
  typers = [],
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  onReply,
  onReact,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const previousScrollHeightRef = useRef(0);

  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  // Preserve scroll position when older messages are prepended
  useLayoutEffect(() => {
    if (previousScrollHeightRef.current > 0 && containerRef.current) {
      const scrollDiff = containerRef.current.scrollHeight - previousScrollHeightRef.current;
      containerRef.current.scrollTop += scrollDiff;
      previousScrollHeightRef.current = 0;
    }
  }, [messages.length]);

  // Initial scroll to bottom & scroll on new message if near bottom
  useEffect(() => {
    if (containerRef.current) {
      const isNearBottom =
        containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight <
        250;

      if (isNearBottom || messages.length <= 30) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, typers]);

  // Handle scroll events for infinite loading and scroll-to-bottom button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    // Show floating scroll to bottom if scrolled up by 300px
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);

    // If near top and has more, load older messages
    if (scrollTop < 80 && hasMore && !loadingMore) {
      previousScrollHeightRef.current = scrollHeight;
      if (onLoadMore) onLoadMore();
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessage = (messageId) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-violet-500", "rounded-3xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-violet-500", "rounded-3xl");
      }, 2000);
    }
  };

  // Group messages by date
  let lastDate = "";

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-1 select-none scrollbar-thin scrollbar-thumb-zinc-800"
    >
      {/* Top Loading Indicator for Infinite Scroll */}
      {loadingMore && (
        <div className="flex justify-center items-center py-2 text-violet-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs ml-2 text-zinc-400">Loading older messages...</span>
        </div>
      )}

      {hasMore && !loadingMore && messages.length > 0 && (
        <div className="text-center py-1">
          <button
            onClick={() => {
              if (containerRef.current) {
                previousScrollHeightRef.current = containerRef.current.scrollHeight;
              }
              if (onLoadMore) onLoadMore();
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ↑ Load earlier messages
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-20 text-zinc-500">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
            💬
          </div>
          <p className="font-semibold text-zinc-300">No messages yet</p>
          <p className="text-xs text-zinc-500 mt-1">Send a message to start the conversation.</p>
        </div>
      ) : (
        messages.map((message, idx) => {
          const dateDivider = formatDateDivider(message.createdAt);
          const showDateDivider = dateDivider !== lastDate;
          if (showDateDivider) {
            lastDate = dateDivider;
          }

          const uniqueMsgKey = message._id
            ? `${message._id}-${idx}`
            : (message.tempId ? `${message.tempId}-${idx}` : `msg-${idx}`);

          return (
            <div key={uniqueMsgKey}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-medium text-zinc-400 shadow-sm">
                    {dateDivider}
                  </span>
                </div>
              )}

              <MessageBubble
                message={message}
                currentUser={currentUser}
                isGroup={isGroup}
                onReply={onReply}
                onReact={onReact}
                onScrollToMessage={scrollToMessage}
                onOpenImageModal={(url) => setSelectedImageModal(url)}
              />
            </div>
          );
        })
      )}

      {/* Typing Indicator Container */}
      <div className="pt-1">
        <TypingIndicator typers={typers} />
      </div>

      {/* Scroll to Bottom Anchor */}
      <div ref={bottomRef} className="h-1" />

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="fixed bottom-24 right-8 z-30 p-3 rounded-full bg-violet-600 text-white shadow-xl hover:bg-violet-500 active:scale-95 transition-all flex items-center justify-center border border-violet-400/30"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Image Lightbox Modal */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <button
            type="button"
            onClick={() => setSelectedImageModal(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-zinc-800/80 text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={selectedImageModal}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
