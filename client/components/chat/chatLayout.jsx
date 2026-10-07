"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import ConversationList from "./ConversationList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import NewChatModal from "./NewChatModal";
import CreateGroup from "../group/CreateGroup";
import GroupSetting from "../group/GroupSetting";
import GlobalSearchModal from "./GlobalSearchModal";
import ProfileModal from "../profile/ProfileModal";
import IncomingCallModal from "../call/IncomingCallModal";
import VideoCallModal from "../call/VideoCallModal";
import NotificationBanner from "./NotificationBanner";
import LiveClock from "./LiveClock";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import useSocket from "../../hooks/useSocket";
import useWebRTC from "../../hooks/useWebRTC";

import { getMyConversations, getConversationById } from "../../services/conversationService";
import { getMessages, sendMessage, toggleReaction, markConversationAsRead } from "../../services/messageService";
import { logoutUser } from "../../services/authService";
import { requestNotificationPermission } from "../../lib/notification";
import { getAvatarColor, getInitials, formatMessageTime, formatLiveLastSeen } from "../../lib/utils";
import socket from "../../lib/socket";

import {
  Users,
  Search,
  Bell,
  BellOff,
  Settings,
  LogOut,
  ChevronLeft,
  Info,
  WifiOff,
  Wifi,
  Sparkles,
  Shield,
  MessageSquare,
  Phone,
  Video,
} from "lucide-react";

export default function ChatLayout({ initialConversationId = null }) {
  const router = useRouter();

  // Auth & Chat states
  const currentUser = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const activeConversation = useChatStore((state) => state.activeConversation);
  const setActiveConversation = useChatStore((state) => state.setActiveConversation);
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const prependMessages = useChatStore((state) => state.prependMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const updateMessageReactions = useChatStore((state) => state.updateMessageReactions);
  const hasMoreMessages = useChatStore((state) => state.hasMoreMessages);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const typingMap = useChatStore((state) => state.typingMap);
  const socketConnected = useChatStore((state) => state.socketConnected);
  const setLoadingConversations = useChatStore((state) => state.setLoadingConversations);
  const setLoadingMessages = useChatStore((state) => state.setLoadingMessages);
  const loadingMoreMessages = useChatStore((state) => state.loadingMoreMessages);
  const setLoadingMoreMessages = useChatStore((state) => state.setLoadingMoreMessages);

  // Modal dialog states
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [isGroupSettingOpen, setIsGroupSettingOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // In-chat search
  const [isInChatSearchOpen, setIsInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");

  // Notification state
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Responsive sidebar toggle for mobile
  const [showMobileSidebar, setShowMobileSidebar] = useState(!initialConversationId);

  // Initialize socket hook
  useSocket();

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoadingConversations(true);
        const data = await getMyConversations();
        setConversations(data.conversations || []);

        if (initialConversationId) {
          const found = (data.conversations || []).find(
            (c) => c._id === initialConversationId
          );
          if (found) {
            handleSelectConversation(found);
          } else {
            const single = await getConversationById(initialConversationId);
            if (single.conversation) {
              handleSelectConversation(single.conversation);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoadingConversations(false);
      }
    };

    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, initialConversationId]);

  // Check notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationEnabled(Notification.permission === "granted");
    }
  }, []);

  const handleToggleNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationEnabled(granted);
    if (!granted && Notification.permission === "denied") {
      alert("Notification permission is blocked in your browser settings.");
    }
  };

  // Select conversation & load messages
  const handleSelectConversation = async (conversation) => {
    setActiveConversation(conversation);
    setShowMobileSidebar(false);
    setIsInChatSearchOpen(false);
    setInChatSearchQuery("");

    // Join socket room
    socket.emit("joinConversation", conversation._id);

    try {
      setLoadingMessages(true);
      const res = await getMessages(conversation._id, 1, 30);
      setMessages(res.messages || [], res.hasMore || false);

      // Mark as read in DB and via socket
      markConversationAsRead(conversation._id).catch(() => {});
      socket.emit("markAsRead", {
        conversationId: conversation._id,
        userId: currentUser?._id || currentUser?.id,
      });
    } catch (err) {
      console.error("Failed to load conversation messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Jump to conversation from in-app notification toast
  const handleSelectConversationById = (conversationId) => {
    const found = conversations.find(
      (c) => (c._id || c.id)?.toString() === conversationId?.toString()
    );
    if (found) {
      handleSelectConversation(found);
    }
  };

  // Live time ticker every 15s to update relative times & last seen
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);

  // Infinite scroll load earlier messages

  const handleLoadMoreMessages = async () => {
    if (!activeConversation || !hasMoreMessages || loadingMoreMessages || messages.length === 0) {
      return;
    }

    try {
      setLoadingMoreMessages(true);
      const oldestMessage = messages[0];
      const res = await getMessages(
        activeConversation._id,
        1,
        30,
        oldestMessage.createdAt
      );

      prependMessages(res.messages || [], res.hasMore || false);
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setLoadingMoreMessages(false);
    }
  };

  // Optimistic message send
  const handleSendMessage = async (payload) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      tempId,
      conversation: payload.conversationId,
      sender: {
        _id: currentUser._id || currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: payload.content,
      type: payload.type,
      attachments: payload.attachments || [],
      replyTo: payload.replyTo ? messages.find((m) => m._id === payload.replyTo) : null,
      reactions: [],
      readBy: [currentUser._id || currentUser.id],
      deliveredTo: [currentUser._id || currentUser.id],
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // Optimistically add to UI immediately
    addMessage(optimisticMessage);

    try {
      const res = await sendMessage(payload);
      if (res.data) {
        // Replace optimistic message with confirmed server message
        res.data.tempId = tempId;
        addMessage(res.data);
      }
    } catch (err) {
      console.error("Send message failed:", err);
      alert(err.response?.data?.message || "Failed to send message. Please retry.");
      // Remove temporary message on failure
      useChatStore.setState((state) => ({
        messages: state.messages.filter((m) => m._id !== tempId),
      }));
    }
  };

  // Toggle message reaction
  const handleReactToMessage = async (messageId, emoji) => {
    try {
      // Optimistically update reactions
      const targetMsg = messages.find((m) => m._id === messageId);
      if (targetMsg) {
        const curUserId = (currentUser._id || currentUser.id)?.toString();
        const existingReactions = [...(targetMsg.reactions || [])];
        const existIdx = existingReactions.findIndex(
          (r) =>
            (r.user?._id || r.user)?.toString() === curUserId &&
            r.emoji === emoji
        );

        if (existIdx > -1) {
          existingReactions.splice(existIdx, 1);
        } else {
          existingReactions.push({ user: currentUser, emoji });
        }
        updateMessageReactions(messageId, existingReactions);
      }

      await toggleReaction(messageId, emoji);
    } catch (err) {
      console.error("Toggle reaction error:", err);
    }
  };

  // Reply handler
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  // WhatsApp WebRTC Video & Voice Calls
  const {
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleScreenShare,
    isScreenSharing,
  } = useWebRTC();

  const handleStartVoiceCall = () => {
    if (!activeConversation) return;
    const target = isGroup ? activeConversation.members?.[0] : otherUser;
    if (!target) return;
    startCall({
      recipient: target,
      conversationId: activeConversation._id,
      isVideo: false,
      isGroup,
    });
  };

  const handleStartVideoCall = () => {
    if (!activeConversation) return;
    const target = isGroup ? activeConversation.members?.[0] : otherUser;
    if (!target) return;
    startCall({
      recipient: target,
      conversationId: activeConversation._id,
      isVideo: true,
      isGroup,
    });
  };

  // Logout
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out?")) return;
    try {
      await logoutUser();
      clearUser();
      socket.disconnect();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      clearUser();
      router.push("/login");
    }
  };

  // In-chat filtered messages
  const displayedMessages = useMemo(() => {
    if (!inChatSearchQuery.trim()) return messages;
    const q = inChatSearchQuery.toLowerCase();
    return messages.filter((m) => m.content?.toLowerCase().includes(q));
  }, [messages, inChatSearchQuery]);

  // Info for active conversation header
  const isGroup = activeConversation?.type === "group";
  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();

  const otherUser = useMemo(() => {
    if (!activeConversation || isGroup) return null;
    return activeConversation.members?.find(
      (m) => (m._id || m.id)?.toString() !== currentUserId
    );
  }, [activeConversation, isGroup, currentUserId]);

  const isOtherUserOnline = useMemo(() => {
    if (!otherUser) return false;
    const oId = (otherUser._id || otherUser.id)?.toString();
    return onlineUsers.some((id) => id?.toString() === oId);
  }, [otherUser, onlineUsers]);

  const conversationTitle = isGroup
    ? activeConversation.name
    : otherUser?.name || otherUser?.username || "Chat";

  const conversationAvatar = isGroup ? activeConversation.avatar : otherUser?.avatar;
  const conversationAvatarId = isGroup ? activeConversation._id : otherUser?._id;

  const currentTypers = activeConversation ? typingMap[activeConversation._id] || [] : [];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f0f2f5] text-[#111b21] font-sans">
      {/* 1. LEFT SIDEBAR */}
      <aside
        className={`${
          showMobileSidebar ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-[#d1d7db] bg-white z-20`}
      >
        {/* Top Header: Current User Bar */}
        <div className="flex items-center justify-between px-4 h-[60px] min-h-[60px] max-h-[60px] border-b border-[#d1d7db] bg-[#f0f2f5] flex-shrink-0">
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative flex-shrink-0">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00a884]/30"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(
                    currentUser?._id || "me"
                  )} flex items-center justify-center font-bold text-white text-sm ring-2 ring-[#00a884]/30`}
                >
                  {getInitials(currentUser?.name || "Me")}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25d366] border-2 border-white shadow-sm" />
            </div>

            <div className="min-w-0 flex flex-col justify-center">
              <h2 className="font-semibold text-sm text-[#111b21] truncate leading-tight group-hover:text-[#008069] transition-colors">
                {currentUser?.name || "User"}
              </h2>
              <p className="text-[11px] text-[#667781] truncate leading-tight mt-0.5">@{currentUser?.username}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1 text-[#54656f]">
            <button
              type="button"
              onClick={() => setIsGlobalSearchOpen(true)}
              title="Search chat history"
              className="p-2 rounded-full hover:text-[#111b21] hover:bg-[#e9edef] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleNotifications}
              title={notificationEnabled ? "Web notifications enabled" : "Enable web notifications"}
              className={`p-2 rounded-full transition-colors ${
                notificationEnabled
                  ? "text-[#008069] bg-[#e7fce3]"
                  : "text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
              }`}
            >
              {notificationEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              title="Settings & Profile"
              className="p-2 rounded-full hover:text-[#111b21] hover:bg-[#e9edef] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="p-2 rounded-full hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resilience Socket Status Warning */}
        {!socketConnected && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs font-medium animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Connecting to real-time chat server...</span>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-hidden bg-white">
          <ConversationList
            onSelectConversation={handleSelectConversation}
            onOpenNewChat={() => setIsNewChatOpen(true)}
            onOpenNewGroup={() => setIsNewGroupOpen(true)}
          />
        </div>
      </aside>

      {/* 2. MAIN CHAT AREA */}
      <main
        className={`${
          !showMobileSidebar ? "flex" : "hidden"
        } md:flex flex-1 flex-col h-full overflow-hidden bg-[#efeae2] relative`}
      >
        {activeConversation ? (
          <>
            {/* Active Conversation Header (WhatsApp Style) */}
            <header className="flex items-center justify-between px-4 sm:px-6 h-[60px] min-h-[60px] max-h-[60px] border-b border-[#d1d7db] bg-[#f0f2f5] z-10 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile Back to Sidebar Button */}
                <button
                  type="button"
                  onClick={() => setShowMobileSidebar(true)}
                  className="md:hidden p-2 -ml-2 rounded-full text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Avatar */}
                <div
                  onClick={() => isGroup && setIsGroupSettingOpen(true)}
                  className={`relative flex-shrink-0 ${isGroup ? "cursor-pointer" : ""}`}
                >
                  {conversationAvatar ? (
                    <img
                      src={conversationAvatar}
                      alt={conversationTitle}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#e9edef]"
                    />
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(
                        conversationAvatarId
                      )} flex items-center justify-center text-white font-bold text-sm shadow-xs`}
                    >
                      {isGroup ? <Users className="w-5 h-5" /> : getInitials(conversationTitle)}
                    </div>
                  )}

                  {!isGroup && (
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                        isOtherUserOnline
                          ? "bg-[#25d366] shadow-xs"
                          : "bg-[#8696a0]"
                      }`}
                    />
                  )}
                </div>

                {/* Info Text: Name & Last Seen */}
                <div className="min-w-0 flex flex-col justify-center">
                  <h1 className="font-semibold text-sm sm:text-base text-[#111b21] truncate flex items-center gap-2 leading-tight">
                    <span>{conversationTitle}</span>
                    {isGroup && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#e7fce3] text-[#008069] border border-[#00a884]/20">
                        Group
                      </span>
                    )}
                  </h1>

                  <p className="text-xs text-[#667781] truncate flex items-center gap-1.5 leading-tight mt-0.5">
                    {isGroup ? (
                      <span>{activeConversation.members?.length || 0} members</span>
                    ) : currentTypers.some((t) => (t._id || t.id)?.toString() === (otherUser?._id || otherUser?.id)?.toString()) ? (
                      <span className="text-[#00a884] font-medium flex items-center gap-1 animate-pulse">
                        typing...
                      </span>
                    ) : isOtherUserOnline ? (
                      <span className="text-[#00a884] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#25d366] animate-pulse" />
                        online
                      </span>
                    ) : (
                      <span className="text-[#667781] font-normal">
                        {formatLiveLastSeen(otherUser?.lastSeen)}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Header Actions: Live Clock, WhatsApp Call Buttons & Search */}
              <div className="flex items-center gap-2">
                {/* Live Digital Clock Badge */}
                <LiveClock className="hidden sm:inline-flex" />

                <div className="flex items-center gap-1 text-[#54656f]">
                  {/* Voice Call Button */}
                  <button
                    type="button"
                    onClick={handleStartVoiceCall}
                    title={isGroup ? "Start group voice call" : "Voice call"}
                    className="p-2 rounded-full text-[#54656f] hover:text-[#008069] hover:bg-[#e9edef] active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  {/* Video Call Button */}
                  <button
                    type="button"
                    onClick={handleStartVideoCall}
                    title={isGroup ? "Start group video call" : "Video call"}
                    className="p-2 rounded-full text-[#54656f] hover:text-[#008069] hover:bg-[#e9edef] active:scale-95 transition-all"
                  >
                    <Video className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    title="Search in this conversation"
                    onClick={() => setIsInChatSearchOpen(!isInChatSearchOpen)}
                    className={`p-2 rounded-full transition-colors ${
                      isInChatSearchOpen
                        ? "text-[#008069] bg-[#e7fce3]"
                        : "text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
                    }`}
                  >
                    <Search className="w-4 h-4" />
                  </button>

                  {isGroup && (
                    <button
                      type="button"
                      title="Group details & settings"
                      onClick={() => setIsGroupSettingOpen(true)}
                      className="p-2 rounded-full text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] transition-colors"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </header>

            {/* In-Chat Search Bar Drawer */}
            {isInChatSearchOpen && (
              <div className="flex items-center gap-2 px-6 py-2 bg-[#f0f2f5] border-b border-[#d1d7db] animate-in slide-in-from-top-2 duration-150">
                <Search className="w-4 h-4 text-[#8696a0] flex-shrink-0" />
                <input
                  type="text"
                  value={inChatSearchQuery}
                  onChange={(e) => setInChatSearchQuery(e.target.value)}
                  placeholder="Filter messages in this conversation..."
                  className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-[#d1d7db] text-xs text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]"
                  autoFocus
                />
                {inChatSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setInChatSearchQuery("")}
                    className="text-xs text-[#667781] hover:text-[#111b21]"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}

            {/* Message Feed with WhatsApp Wallpaper Pattern */}
            <div className="flex-1 overflow-hidden flex flex-col wa-chat-pattern">
              <MessageList
                messages={displayedMessages}
                currentUser={currentUser}
                isGroup={isGroup}
                typers={currentTypers}
                hasMore={hasMoreMessages && !inChatSearchQuery}
                loadingMore={loadingMoreMessages}
                onLoadMore={handleLoadMoreMessages}
                onReply={handleReplyToMessage}
                onReact={handleReactToMessage}
              />
            </div>

            {/* Message Composer Input */}
            <MessageInput
              conversationId={activeConversation._id}
              onSendMessage={handleSendMessage}
            />
          </>
        ) : (
          /* WhatsApp Web Style Empty Active State with continuous top header line */
          <div className="flex-1 flex flex-col h-full bg-[#f0f2f5] select-none">
            {/* Top Empty Header Bar to keep continuous header line across the page */}
            <div className="h-[60px] min-h-[60px] max-h-[60px] border-b border-[#d1d7db] bg-[#f0f2f5] w-full flex-shrink-0" />

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-b-6 border-[#25d366]">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-[#e7fce3] border border-[#00a884]/20 flex items-center justify-center text-4xl shadow-sm">
                  <MessageSquare className="w-12 h-12 text-[#008069]" />
                </div>
              </div>

              <h2 className="text-2xl font-light text-[#41525d] mb-3">
                PulseChat for Web
              </h2>
              <p className="max-w-md text-sm text-[#667781] mb-8 leading-relaxed">
                Send and receive end-to-end encrypted messages with 1-on-1 chats, group channels,
                audio & video calls, live last seen status, and file sharing.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#008069] hover:bg-[#00a884] text-white font-medium text-sm shadow-sm active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>New Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewGroupOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-[#f5f6f6] border border-[#d1d7db] text-[#111b21] font-medium text-sm shadow-xs active:scale-95 transition-all"
                >
                  <Users className="w-4 h-4" />
                  <span>New Group</span>
                </button>
              </div>

              <p className="text-xs text-[#8696a0] flex items-center gap-1.5">
                <span>🔒</span>
                <span>End-to-end encrypted real-time messaging</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* 3. MODAL DIALOGS */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectConversation={(conv) => handleSelectConversation(conv)}
      />

      <CreateGroup
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onGroupCreated={(conv) => handleSelectConversation(conv)}
      />

      <GroupSetting
        isOpen={isGroupSettingOpen}
        onClose={() => setIsGroupSettingOpen(false)}
        conversation={activeConversation}
        onConversationUpdated={(updated) => setActiveConversation(updated)}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        activeConversationId={activeConversation?._id}
        onSelectMessageResult={(msg) => {
          const targetConv =
            typeof msg.conversation === "object"
              ? msg.conversation
              : conversations.find((c) => c._id === msg.conversation);

          if (targetConv) {
            handleSelectConversation(targetConv);
            setTimeout(() => {
              const el = document.getElementById(`msg-${msg._id}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-2", "ring-violet-500");
                setTimeout(() => el.classList.remove("ring-2", "ring-violet-500"), 2000);
              }
            }, 300);
          }
        }}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* WhatsApp Voice & Video Call Modals */}
      <IncomingCallModal onAccept={acceptCall} onDecline={declineCall} />
      <VideoCallModal
        onEndCall={endCall}
        onToggleScreenShare={toggleScreenShare}
        isScreenSharing={isScreenSharing}
      />

      {/* WhatsApp-Style In-App Notification Toasts */}
      <NotificationBanner onSelectConversation={handleSelectConversationById} />
    </div>
  );
}
