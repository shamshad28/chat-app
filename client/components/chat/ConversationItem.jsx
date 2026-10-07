"use client";

import { useMemo } from "react";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import { formatConversationDate, formatRelativeTime, getInitials, getAvatarColor } from "../../lib/utils";
import { Users, Image as ImageIcon, Video, FileText } from "lucide-react";

export default function ConversationItem({ conversation, isSelected, onClick }) {
  const currentUser = useAuthStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const typingMap = useChatStore((state) => state.typingMap);

  const isGroup = conversation.type === "group";

  // Find other user in direct conversation
  const otherUser = useMemo(() => {
    if (isGroup) return null;
    const currentId = currentUser?._id || currentUser?.id;
    return conversation.members?.find(
      (m) => (m._id || m.id)?.toString() !== currentId?.toString()
    );
  }, [conversation, currentUser, isGroup]);

  // Online status check
  const isOnline = useMemo(() => {
    if (isGroup) return false;
    if (!otherUser) return false;
    const otherId = (otherUser._id || otherUser.id)?.toString();
    return onlineUsers.some((id) => id?.toString() === otherId);
  }, [isGroup, otherUser, onlineUsers]);

  // Typing status in this conversation
  const typers = typingMap[conversation._id] || [];
  const isSomeoneTyping = typers.length > 0;

  // Title & avatar
  const title = isGroup
    ? conversation.name || "Group Channel"
    : otherUser?.name || otherUser?.username || "Direct Chat";

  const avatarUrl = isGroup ? conversation.avatar : otherUser?.avatar;
  const avatarId = isGroup ? conversation._id : otherUser?._id || conversation._id;

  // Last message snippet
  const lastMessage = conversation.lastMessage;
  const renderLastMessageSnippet = () => {
    if (isSomeoneTyping) {
      const typerName = typers[0]?.name || "Someone";
      return (
        <span className="text-violet-400 font-medium italic animate-pulse">
          {typerName} is typing...
        </span>
      );
    }

    if (!lastMessage) {
      return <span className="text-zinc-500 italic">No messages yet</span>;
    }

    const senderPrefix = isGroup && lastMessage.sender
      ? `${(lastMessage.sender?._id || lastMessage.sender?.id)?.toString() === (currentUser?._id || currentUser?.id)?.toString() ? "You" : lastMessage.sender.name || "Member"}: `
      : "";

    if (lastMessage.type === "image") {
      return (
        <span className="flex items-center gap-1 text-zinc-400">
          <ImageIcon className="w-3.5 h-3.5 text-violet-400" />
          <span>{senderPrefix}Photo</span>
        </span>
      );
    }
    if (lastMessage.type === "video") {
      return (
        <span className="flex items-center gap-1 text-zinc-400">
          <Video className="w-3.5 h-3.5 text-violet-400" />
          <span>{senderPrefix}Video</span>
        </span>
      );
    }
    if (lastMessage.type === "document") {
      return (
        <span className="flex items-center gap-1 text-zinc-400">
          <FileText className="w-3.5 h-3.5 text-violet-400" />
          <span>{senderPrefix}Document</span>
        </span>
      );
    }

    return (
      <span className="truncate">
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
      className={`relative flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors duration-150 select-none border-b border-[#f0f2f5] ${
        isSelected
          ? "bg-[#f0f2f5]"
          : "bg-white hover:bg-[#f5f6f6]"
      }`}
    >
      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={title}
            className="w-12 h-12 rounded-full object-cover ring-1 ring-[#e9edef]"
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getAvatarColor(
              avatarId
            )} flex items-center justify-center text-white font-medium text-base shadow-xs`}
          >
            {isGroup ? <Users className="w-5 h-5 text-white/90" /> : getInitials(title)}
          </div>
        )}

        {/* Live Presence Indicator */}
        {!isGroup && (
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white transition-colors ${
              isOnline
                ? "bg-[#25d366] shadow-xs"
                : "bg-[#8696a0]"
            }`}
            title={isOnline ? "Online" : "Offline"}
          />
        )}

        {isGroup && (
          <span className="absolute bottom-0 right-0 bg-[#008069] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {conversation.members?.length || 2}
          </span>
        )}
      </div>

      {/* Info Container */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="font-medium text-sm truncate text-[#111b21] flex items-center gap-1.5">
            {title}
          </h3>
          <span className="text-[11px] text-[#667781] flex-shrink-0">
            {formatRelativeTime(lastMessage?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-[#667781] truncate flex-1 leading-normal">
            {renderLastMessageSnippet()}
          </p>
        </div>
      </div>
    </div>
  );
}
