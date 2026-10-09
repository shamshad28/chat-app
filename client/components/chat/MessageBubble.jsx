"use client";

import { useState } from "react";
import { formatMessageTime, formatFileSize, getAvatarColor, getInitials } from "../../lib/utils";
import ReactionPicker from "./ReactionPicker";
import {
  Check,
  CheckCheck,
  Clock,
  CornerUpLeft,
  Copy,
  Smile,
  FileText,
  Download,
  ExternalLink,
} from "lucide-react";

export default function MessageBubble({
  message,
  currentUser,
  isGroup,
  onReply,
  onReact,
  onScrollToMessage,
  onOpenImageModal,
}) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const senderId = (message.sender?._id || message.sender?.id || message.sender)?.toString();
  const isMe = senderId === currentUserId;

  const isPending = !!message.isOptimistic;

  // Determine delivery / read receipt status
  const isRead =
    message.readBy &&
    message.readBy.some((id) => (id?._id || id)?.toString() !== currentUserId);

  const isDelivered =
    message.deliveredTo &&
    message.deliveredTo.some((id) => (id?._id || id)?.toString() !== currentUserId);

  // Group reactions by emoji: { [emoji]: { count, hasUserReacted, users } }
  const reactionGroups = (message.reactions || []).reduce((acc, curr) => {
    if (!acc[curr.emoji]) {
      acc[curr.emoji] = {
        count: 0,
        hasUserReacted: false,
      };
    }
    acc[curr.emoji].count += 1;
    const reactUserId = (curr.user?._id || curr.user?.id || curr.user)?.toString();
    if (reactUserId === currentUserId) {
      acc[curr.emoji].hasUserReacted = true;
    }
    return acc;
  }, {});

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id={`msg-${message._id}`}
      className={`group relative flex gap-2.5 my-2 transition-colors ${
        isMe ? "justify-end" : "justify-start"
      }`}
    >
      {/* Left Avatar for Received messages in Group */}
      {!isMe && (
        <div className="flex-shrink-0 self-end mb-1">
          {message.sender?.avatar ? (
            <img
              src={message.sender.avatar}
              alt={message.sender.name || "User"}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-[#e9edef]"
            />
          ) : (
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-tr ${getAvatarColor(
                senderId || "default"
              )} flex items-center justify-center text-white text-xs font-bold shadow-xs`}
            >
              {getInitials(message.sender?.name || "User")}
            </div>
          )}
        </div>
      )}

      {/* Bubble Container */}
      <div className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        {/* Sender name in group */}
        {!isMe && isGroup && (
          <span className="text-[11px] font-semibold text-[#008069] mb-0.5 ml-1">
            {message.sender?.name || message.sender?.username || "Member"}
          </span>
        )}

        {/* Floating Quick Action Toolbar on Hover */}
        <div
          className={`absolute z-20 -top-8 hidden group-hover:flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md border border-[#e9edef] shadow-md ${
            isMe ? "right-2" : "left-2"
          }`}
        >
          <button
            type="button"
            title="React"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition-colors"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="Reply"
            onClick={() => onReply(message)}
            className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition-colors"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>
          {message.content && (
            <button
              type="button"
              title={copied ? "Copied!" : "Copy"}
              onClick={handleCopy}
              className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Reaction Picker Overlay */}
        {showReactionPicker && (
          <ReactionPicker
            onSelect={(emoji) => onReact(message._id, emoji)}
            onClose={() => setShowReactionPicker(false)}
            position="top"
          />
        )}

        {/* Main Bubble Card (WhatsApp Dark: Outgoing #005c4b, Incoming #202c33) */}
        <div
          className={`relative px-3 py-2 shadow-[0_1px_0.5px_rgba(11,20,26,0.13)] transition-all ${
            isMe
              ? "bg-[#005c4b] text-[#e9edef] rounded-xl rounded-tr-xs"
              : "bg-[#202c33] text-[#e9edef] rounded-xl rounded-tl-xs"
          }`}
        >
          {/* Threaded Reply Quote Preview */}
          {message.replyTo && (
            <div
              onClick={() => onScrollToMessage && onScrollToMessage(message.replyTo._id)}
              className={`mb-2 p-2 rounded-lg text-xs cursor-pointer border-l-4 transition-opacity hover:opacity-90 ${
                isMe
                  ? "bg-black/20 border-[#25d366] text-[#e9edef]"
                  : "bg-[#182229] border-[#00a884] text-[#e9edef]"
              }`}
            >
              <div className="flex items-center gap-1 font-semibold text-[11px] mb-0.5 text-[#00a884]">
                <CornerUpLeft className="w-3 h-3 opacity-80" />
                <span>
                  {message.replyTo.sender?.name ||
                    (message.replyTo.sender === currentUserId ? "You" : "User")}
                </span>
              </div>
              <p className="truncate line-clamp-1 italic text-[11px] text-[#8696a0]">
                {message.replyTo.content ||
                  (message.replyTo.type === "image" ? "📷 Photo" : "📎 Attachment")}
              </p>
            </div>
          )}

          {/* Media Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="space-y-1.5 mb-1.5">
              {message.attachments.map((att, idx) => {
                const attType = att.type || (att.mimeType?.startsWith("image/") ? "image" : "document");

                if (attType === "image" || att.mimeType?.startsWith("image/")) {
                  return (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-xl cursor-pointer group/img relative"
                      onClick={() => onOpenImageModal && onOpenImageModal(att.url)}
                    >
                      <img
                        src={att.url}
                        alt={att.fileName || "Image"}
                        className="max-h-72 w-full object-cover rounded-xl hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-white drop-shadow" />
                      </div>
                    </div>
                  );
                }

                if (attType === "video" || att.mimeType?.startsWith("video/")) {
                  return (
                    <div key={idx} className="rounded-xl overflow-hidden bg-black max-w-sm">
                      <video src={att.url} controls className="max-h-72 w-full rounded-xl" />
                    </div>
                  );
                }

                if (attType === "audio" || att.mimeType?.startsWith("audio/")) {
                  return (
                    <div key={idx} className="p-2 rounded-xl bg-black/5 min-w-[240px]">
                      <audio src={att.url} controls className="w-full h-9" />
                    </div>
                  );
                }

                // Document / other files
                return (
                  <a
                    key={idx}
                    href={att.url}
                    download={att.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                      isMe
                        ? "bg-black/5 hover:bg-black/10 text-[#111b21]"
                        : "bg-[#f0f2f5] hover:bg-[#e9edef] text-[#111b21]"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-[#008069]/15 text-[#008069]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{att.fileName || "File"}</p>
                      <p className="text-[10px] text-[#667781]">{formatFileSize(att.size)}</p>
                    </div>
                    <div className="p-1.5 rounded-lg hover:bg-black/5">
                      <Download className="w-3.5 h-3.5 text-[#54656f]" />
                    </div>
                  </a>
                );
              })}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <p className="text-[14.2px] text-[#e9edef] leading-relaxed break-words whitespace-pre-wrap select-text pr-2">
              {message.content}
            </p>
          )}

          {/* Footer: Time & WhatsApp Blue Check Receipts */}
          <div
            className={`flex items-center gap-1 mt-0.5 text-[11px] ${
              isMe ? "justify-end text-[#8696a0]" : "justify-end text-[#8696a0]"
            }`}
          >
            <span className="text-[10.5px] leading-none">{formatMessageTime(message.createdAt)}</span>

            {/* Read Receipts for sender */}
            {isMe && (
              <span className="flex items-center ml-0.5">
                {isPending ? (
                  <Clock className="w-3 h-3 text-[#8696a0] animate-spin" />
                ) : isRead ? (
                  <CheckCheck className="w-4 h-4 text-[#53bdeb] stroke-[2.2]" title="Read" />
                ) : isDelivered ? (
                  <CheckCheck className="w-4 h-4 text-[#8696a0]" title="Delivered" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-[#8696a0]" title="Sent" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges Below Bubble */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex flex-wrap items-center gap-1 mt-0.5 -mb-1 px-1">
            {Object.entries(reactionGroups).map(([emoji, group]) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(message._id, emoji)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs shadow-xs transition-all active:scale-95 ${
                  group.hasUserReacted
                    ? "bg-[#005c4b] border border-[#25d366]/40 text-[#25d366]"
                    : "bg-[#202c33] hover:bg-[#2a3942] border border-[#2a3942] text-[#e9edef]"
                }`}
              >
                <span>{emoji}</span>
                <span className="text-[10px] font-semibold">{group.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
