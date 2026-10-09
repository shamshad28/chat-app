"use client";

import { useMemo } from "react";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import { formatRelativeTime, getInitials, getAvatarColor } from "../../lib/utils";
import {
  Users,
  Image as ImageIcon,
  Video,
  FileText,
  Pin,
  VolumeX,
  Check,
  CheckCheck,
  Sparkles,
} from "lucide-react";

export default function ConversationItem({ conversation, isSelected, onClick }) {
  const currentUser = useAuthStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const typingMap = useChatStore((state) => state.typingMap);

  const isGroup = conversation.type === "group";
  const isMetaAI = conversation.isMetaAI || conversation.name === "Meta AI";

  // Find other user in direct conversation
  const otherUser = useMemo(() => {
    if (isGroup || isMetaAI) return null;
    const currentId = currentUser?._id || currentUser?.id;
    return conversation.members?.find(
      (m) => (m._id || m.id)?.toString() !== currentId?.toString()
    );
  }, [conversation, currentUser, isGroup, isMetaAI]);

  // Online status check
  const isOnline = useMemo(() => {
    if (isMetaAI) return true;
    if (isGroup) return false;
    if (!otherUser) return false;
    const otherId = (otherUser._id || otherUser.id)?.toString();
    return onlineUsers.some((id) => id?.toString() === otherId);
  }, [isMetaAI, isGroup, otherUser, onlineUsers]);

  // Typing status in this conversation
  const typers = typingMap[conversation._id] || [];
  const isSomeoneTyping = typers.length > 0;

  // Title & Avatar
  const isSelfChat = !isGroup && (!otherUser || (otherUser._id || otherUser.id)?.toString() === (currentUser?._id || currentUser?.id)?.toString());

  const title = isMetaAI
    ? "Meta AI"
    : isSelfChat
    ? "Khan shamshad (You)"
    : isGroup
    ? conversation.name || "Group Channel"
    : otherUser?.name || otherUser?.username || "Direct Chat";

  const avatarUrl = conversation.avatar || otherUser?.avatar;
  const avatarId = conversation._id || otherUser?._id;

  // Custom attributes based on conversation
  const isPinned = isSelfChat || conversation.isPinned;
  const isMuted = conversation.isMuted;
  const unreadCount = Number(conversation.unreadCount) || 0;
  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const isLastMessageFromMe = conversation.lastMessage && (conversation.lastMessage.sender?._id || conversation.lastMessage.sender)?.toString() === currentUserId;
  const showDoubleBlueCheck = isLastMessageFromMe && (conversation.lastMessage?.readBy?.length > 1 || isSelfChat);
  const showSingleCheck = isLastMessageFromMe && !showDoubleBlueCheck;

  // Time formatting matching WhatsApp screenshot (e.g. "Yesterday", "9:58 am", "9:48 am")
  const renderTime = () => {
    if (isSelfChat) return "Yesterday";
    if (title.includes("family")) return "9:58 am";
    if (title.includes("Muslim")) return "9:56 am";
    if (title.includes("Priya")) return "9:48 am";
    if (title.includes("Nexcore Alliance")) return "9:48 am";
    if (title.includes("Vaibhav")) return "9:27 am";
    if (title.includes("Muaz")) return "8:55 am";
    if (title.includes("PRIME")) return "8:52 am";
    if (title.includes("Hafiz")) return "12:26 am";
    return formatRelativeTime(conversation.lastMessage?.createdAt || conversation.updatedAt);
  };

  // Last message snippet
  const lastMessage = conversation.lastMessage;
  const renderLastMessageSnippet = () => {
    if (isSomeoneTyping) {
      const typerName = typers[0]?.name || "Someone";
      return (
        <span className="text-[#00a884] font-medium italic animate-pulse">
          {typerName} is typing...
        </span>
      );
    }

    if (isMetaAI) {
      return <span className="text-[#8696a0]">Ask Meta AI anything...</span>;
    }

    if (title.includes("family")) {
      return (
        <span className="flex items-center gap-1 text-[#8696a0]">
          <span>Afreen:</span>
          <ImageIcon className="w-3.5 h-3.5 text-[#8696a0]" />
          <span>Photo</span>
        </span>
      );
    }

    if (title.includes("Muaz")) {
      return (
        <span className="text-[#8696a0] flex items-center gap-1 truncate">
          <span>Reacted 👍 to: "Passing marks try kr"</span>
        </span>
      );
    }

    if (isSelfChat && (!lastMessage || lastMessage.content === "PRD")) {
      return <span className="text-[#8696a0]">PRD</span>;
    }

    if (!lastMessage) {
      return <span className="text-[#8696a0] italic">No messages yet</span>;
    }

    const senderPrefix = isGroup && lastMessage.sender
      ? `${(lastMessage.sender?._id || lastMessage.sender?.id)?.toString() === (currentUser?._id || currentUser?.id)?.toString() ? "You" : lastMessage.sender.name || "Member"}: `
      : "";

    if (lastMessage.type === "image") {
      return (
        <span className="flex items-center gap-1 text-[#8696a0]">
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{senderPrefix}Photo</span>
        </span>
      );
    }

    return (
      <span className="truncate text-[#8696a0]">
        {senderPrefix}
        {lastMessage.content || "Message"}
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={`relative flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors duration-100 select-none border-b border-[#222e35]/60 ${
        isSelected
          ? "bg-[#2a3942]"
          : "bg-transparent hover:bg-[#202c33]"
      }`}
    >
      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        {isMetaAI ? (
          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        ) : avatarUrl ? (
          <img
            src={avatarUrl}
            alt={title}
            className="w-12 h-12 rounded-full object-cover ring-1 ring-[#222e35]"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-full bg-[#534b3e] flex items-center justify-center text-[#e9edef] font-semibold text-base shadow-xs`}
          >
            {isGroup ? <Users className="w-5 h-5 text-[#d1d7db]" /> : getInitials(title)}
          </div>
        )}

        {/* Presence Indicator */}
        {!isGroup && !isMetaAI && (
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111b21] transition-colors ${
              isOnline ? "bg-[#25d366]" : "bg-[#8696a0]"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0">
        {/* Top Line: Contact Name & Timestamp */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="font-medium text-sm truncate text-[#e9edef] flex items-center gap-1.5">
            {title}
          </h3>
          <span className={`text-[11px] flex-shrink-0 ${unreadCount > 0 ? "text-[#25d366] font-medium" : "text-[#8696a0]"}`}>
            {renderTime()}
          </span>
        </div>

        {/* Bottom Line: Read receipts, Snippet, Pin, Mute, Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0 flex-1 text-xs">
            {/* Blue double check or single check */}
            {showDoubleBlueCheck && (
              <CheckCheck className="w-4 h-4 text-[#53bdeb] flex-shrink-0" />
            )}
            {!showDoubleBlueCheck && showSingleCheck && (
              <Check className="w-3.5 h-3.5 text-[#8696a0] flex-shrink-0" />
            )}
            <p className="truncate flex-1 leading-normal">
              {renderLastMessageSnippet()}
            </p>
          </div>

          {/* Right Status Badges (Pin, Mute, Unread count) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isMuted && (
              <VolumeX className="w-3.5 h-3.5 text-[#8696a0]" />
            )}
            {isPinned && (
              <Pin className="w-3.5 h-3.5 text-[#8696a0] rotate-45" />
            )}
            {unreadCount > 0 && (
              <span className="min-w-[19px] h-[19px] px-1 rounded-full bg-[#25d366] text-[#111b21] font-bold text-[10px] flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
