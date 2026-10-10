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
import WhatsAppTitleBar from "./WhatsAppTitleBar";
import WhatsAppSidebarDock from "./WhatsAppSidebarDock";
import WhatsAppEmptyState from "./WhatsAppEmptyState";
import DummyLLMChat from "./DummyLLMChat";
import WhatsAppSettingsModal from "./WhatsAppSettingsModal";
import CallsList from "../call/CallsList";
import ContactInfoSidebar from "./ContactInfoSidebar";
import StatusList from "../status/StatusList";
import ChannelsCommunitiesView from "./ChannelsCommunitiesView";

import useAuthStore from "../../store/authStore";
import useChatStore from "../../store/chatStore";
import useSocket from "../../hooks/useSocket";
import useWebRTC from "../../hooks/useWebRTC";

import {
  getMyConversations,
  getConversationById,
  deleteConversation,
  clearChatMessages,
} from "../../services/conversationService";
import {
  getMessages,
  sendMessage,
  toggleReaction,
  markConversationAsRead,
  deleteMessage,
} from "../../services/messageService";
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
  Trash2,
  UploadCloud,
} from "lucide-react";

export default function ChatLayout({ initialConversationId = null }) {
  const router = useRouter();

  // Auth & Chat states
  const currentUser = useAuthStore((state) => state.user);
  const clearUser = useAuthStore((state) => state.clearUser);

  const conversations = useChatStore((state) => state.conversations);
  const setConversations = useChatStore((state) => state.setConversations);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const removeConversation = useChatStore((state) => state.removeConversation);
  const clearMessagesInStore = useChatStore((state) => state.clearMessagesInStore);
  const deleteMessageInStore = useChatStore((state) => state.deleteMessageInStore);
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // WhatsApp Desktop navigation states
  const [activeDockView, setActiveDockView] = useState("chats");
  const [showMetaAIChat, setShowMetaAIChat] = useState(false);
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [missedCallsCount, setMissedCallsCount] = useState(1);

  // Real unread messages calculation (never hardcoded!)
  const totalUnreadCount = useMemo(() => {
    return (conversations || []).reduce(
      (acc, c) => acc + (Number(c.unreadCount) || 0),
      0
    );
  }, [conversations]);

  // In-chat search
  const [isInChatSearchOpen, setIsInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState("");

  // Notification state
  const [notificationEnabled, setNotificationEnabled] = useState(false);

  // Responsive sidebar toggle for mobile
  const [showMobileSidebar, setShowMobileSidebar] = useState(!initialConversationId);

  // Flexible resizable sidebar width on desktop
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isDesktop, setIsDesktop] = useState(false);
  const isResizingRef = useRef(false);

  // Drag and drop file upload states
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);
  const [stagedDroppedFiles, setStagedDroppedFiles] = useState(null);

  // Check desktop viewport width
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Split-pane sidebar resize handlers
  const handleStartResize = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (moveEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.min(Math.max(moveEvent.clientX - 54, 280), 580);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Drag & drop file upload handlers across chat workspace
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setStagedDroppedFiles({ id: Date.now(), files });
    }
  };

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
    setShowMetaAIChat(false);
    setActiveDockView("chats");
    setActiveConversation(conversation);
    setShowMobileSidebar(false);
    setIsInChatSearchOpen(false);
    setInChatSearchQuery("");
    setIsContactInfoOpen(false);

    // Immediately mark conversation unread count as 0 in store to drop unread badge
    updateConversation({ ...conversation, unreadCount: 0 });

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

  // Delete entire conversation
  const handleDeleteConversation = async (conversationId) => {
    try {
      await deleteConversation(conversationId);
      removeConversation(conversationId);
      if (activeConversation?._id === conversationId) {
        setActiveConversation(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete conversation");
    }
  };

  // Clear all messages in conversation
  const handleClearChat = async (conversationId) => {
    try {
      await clearChatMessages(conversationId);
      clearMessagesInStore(conversationId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to clear chat");
    }
  };

  // Delete single message
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      deleteMessageInStore(messageId);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete message");
    }
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#111b21] text-[#e9edef] font-sans">
      {/* 1. NATIVE-LOOKING WINDOW TITLE BAR (Desktop Only) */}
      <div className="hidden md:block flex-shrink-0">
        <WhatsAppTitleBar />
      </div>

      {/* 2. MAIN APPLICATION WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* A. Far Left Vertical Dock (Desktop) & Bottom Navigation Bar (Mobile) */}
        <WhatsAppSidebarDock
          activeView={showMetaAIChat ? "meta-ai" : activeDockView}
          onSelectView={(view) => {
            setActiveDockView(view);
            if (view === "meta-ai") {
              setShowMetaAIChat(true);
              setActiveConversation(null);
            } else {
              setShowMetaAIChat(false);
            }
            if (view === "calls") {
              setMissedCallsCount(0);
            }
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          currentUser={currentUser}
          unreadChatsCount={totalUnreadCount}
          missedCallsCount={missedCallsCount}
          showMobileBar={showMobileSidebar && !showMetaAIChat}
        />

        {/* B. Middle Sidebar Column (Chats / Calls / Status / Channels / Communities) */}
        <aside
          style={isDesktop ? { width: `${sidebarWidth}px`, minWidth: "280px", maxWidth: "580px" } : {}}
          className={`${
            showMobileSidebar && !showMetaAIChat ? "flex" : "hidden"
          } md:flex flex-col w-full flex-shrink-0 bg-[#111b21] md:border-r border-[#222e35] z-10 pb-[56px] md:pb-0 h-full`}
        >
          {/* Resilience Socket Status Warning */}
          {!socketConnected && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/70 border-b border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Connecting to real-time chat server...</span>
            </div>
          )}

          {/* Dynamic Middle Panel View based on Dock Selection */}
          <div className="flex-1 overflow-hidden bg-[#111b21]">
            {activeDockView === "chats" && (
              <ConversationList
                onSelectConversation={(conv) => {
                  setShowMetaAIChat(false);
                  setActiveDockView("chats");
                  handleSelectConversation(conv);
                }}
                onOpenNewChat={() => setIsNewChatOpen(true)}
                onOpenNewGroup={() => setIsNewGroupOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenMetaAI={() => {
                  setShowMetaAIChat(true);
                  setActiveDockView("meta-ai");
                  setActiveConversation(null);
                }}
                onLogout={handleLogout}
              />
            )}

            {activeDockView === "calls" && (
              <CallsList
                onStartVoiceCall={(target) => {
                  startCall({
                    recipient: target,
                    conversationId: activeConversation?._id || "call",
                    isVideo: false,
                    isGroup: target?.isGroup,
                  });
                }}
                onStartVideoCall={(target) => {
                  startCall({
                    recipient: target,
                    conversationId: activeConversation?._id || "call",
                    isVideo: true,
                    isGroup: target?.isGroup,
                  });
                }}
                onSelectContactForChat={(conv) => {
                  setActiveDockView("chats");
                  handleSelectConversation(conv);
                }}
                conversations={conversations}
              />
            )}

            {activeDockView === "status" && (
              <StatusList
                currentUser={currentUser}
                onSendReply={(contactName, reply) => {
                  const matchingConv = conversations.find(
                    (c) =>
                      c.name === contactName ||
                      (c.members || []).some((m) => m.name === contactName)
                  );
                  if (matchingConv) {
                    handleSelectConversation(matchingConv);
                    handleSendMessage({
                      conversationId: matchingConv._id,
                      content: reply,
                      type: "text",
                    });
                  }
                }}
              />
            )}

            {(activeDockView === "channels" ||
              activeDockView === "communities" ||
              activeDockView === "archived" ||
              activeDockView === "starred") && (
              <ChannelsCommunitiesView
                viewType={activeDockView}
                conversations={conversations}
                onSelectConversation={(conv) => {
                  setActiveDockView("chats");
                  handleSelectConversation(conv);
                }}
              />
            )}
          </div>
        </aside>

        {/* Draggable Resizer Bar (Desktop Only - Flexible Split Pane) */}
        <div
          onMouseDown={handleStartResize}
          onDoubleClick={() => setSidebarWidth(380)}
          title="Drag to resize sidebar width (Double click to reset)"
          className="hidden md:flex w-1 hover:w-1.5 bg-transparent hover:bg-[#00a884] active:bg-[#00a884] cursor-col-resize select-none h-full z-20 transition-all items-center justify-center group flex-shrink-0"
        >
          <div className="w-0.5 h-8 rounded-full bg-[#2a3942] group-hover:bg-[#00a884] transition-colors" />
        </div>

        {/* C. Right Main Pane: Meta AI Chat / Active Chat / WhatsApp Empty State */}
        <main
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`${
            !showMobileSidebar || showMetaAIChat ? "flex" : "hidden"
          } md:flex flex-1 flex-col h-full overflow-hidden bg-[#0b141a] relative`}
        >
          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && activeConversation && (
            <div className="absolute inset-0 z-50 bg-[#0b141a]/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#00a884] m-3 rounded-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
              <div className="w-20 h-20 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center text-[#00a884] mb-4 shadow-[0_0_30px_rgba(0,168,132,0.3)] animate-pulse">
                <UploadCloud className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#e9edef] tracking-tight">
                Drop files here to send
              </h3>
              <p className="text-sm text-[#8696a0] mt-1.5 max-w-xs text-center">
                Photos, videos, audio, and documents will be attached instantly
              </p>
              <div className="mt-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#202c33] border border-[#2a3942] text-xs text-[#25d366] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready to attach</span>
              </div>
            </div>
          )}
          {showMetaAIChat ? (
            /* Interactive Dummy LLM Meta AI Chat */
            <DummyLLMChat
              onClose={() => {
                setShowMetaAIChat(false);
                setActiveDockView("chats");
              }}
            />
          ) : activeConversation ? (
            <>
              {/* Active Conversation Header (WhatsApp Dark Desktop Style) */}
              <header className="flex items-center justify-between px-4 sm:px-6 h-[60px] min-h-[60px] max-h-[60px] border-b border-[#222e35] bg-[#202c33] z-10 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileSidebar(true)}
                    className="md:hidden p-2 -ml-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Clickable Avatar & Contact Info */}
                  <div
                    onClick={() => setIsContactInfoOpen(true)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative flex-shrink-0">
                      {conversationAvatar ? (
                        <img
                          src={conversationAvatar}
                          alt={conversationTitle}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-[#222e35] group-hover:ring-[#00a884] transition-all"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full bg-[#534b3e] flex items-center justify-center text-[#e9edef] font-semibold text-sm shadow-xs group-hover:ring-1 group-hover:ring-[#00a884] transition-all"
                        >
                          {isGroup ? <Users className="w-5 h-5" /> : getInitials(conversationTitle)}
                        </div>
                      )}

                      {!isGroup && (
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#202c33] ${
                            isOtherUserOnline
                              ? "bg-[#25d366] shadow-xs"
                              : "bg-[#8696a0]"
                          }`}
                        />
                      )}
                    </div>

                    {/* Contact Title & Status */}
                    <div className="min-w-0 flex flex-col justify-center">
                      <h1 className="font-semibold text-sm sm:text-base text-[#e9edef] group-hover:text-white truncate flex items-center gap-2 leading-tight transition-colors">
                        <span>{conversationTitle}</span>
                        {isGroup && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#103629] text-[#25d366] border border-[#25d366]/20">
                            Group
                          </span>
                        )}
                      </h1>

                      <p className="text-xs text-[#8696a0] truncate flex items-center gap-1.5 leading-tight mt-0.5">
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
                          <span className="text-[#8696a0] font-normal">
                            {formatLiveLastSeen(otherUser?.lastSeen)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Header Actions: Call Buttons & In-Chat Search & Contact Info */}
                <div className="flex items-center gap-2">
                  <LiveClock className="hidden sm:inline-flex" />

                  <div className="flex items-center gap-0.5 sm:gap-1 text-[#aebac1]">
                    <button
                      type="button"
                      onClick={handleStartVoiceCall}
                      title={isGroup ? "Start group voice call" : "Voice call"}
                      className="p-1.5 sm:p-2 rounded-full hover:text-[#00a884] hover:bg-[#2a3942] active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleStartVideoCall}
                      title={isGroup ? "Start group video call" : "Video call"}
                      className="p-1.5 sm:p-2 rounded-full hover:text-[#00a884] hover:bg-[#2a3942] active:scale-95 transition-all"
                    >
                      <Video className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title="Search in this conversation"
                      onClick={() => setIsInChatSearchOpen(!isInChatSearchOpen)}
                      className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                        isInChatSearchOpen
                          ? "text-[#00a884] bg-[#103629]"
                          : "text-[#aebac1] hover:text-[#e9edef] hover:bg-[#2a3942]"
                      }`}
                    >
                      <Search className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title={isGroup ? "Group info & settings" : "Contact info & details"}
                      onClick={() => setIsContactInfoOpen(!isContactInfoOpen)}
                      className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                        isContactInfoOpen
                          ? "text-[#00a884] bg-[#2a3942]"
                          : "text-[#aebac1] hover:text-[#e9edef] hover:bg-[#2a3942]"
                      }`}
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      title={isGroup ? "Delete group" : "Delete chat"}
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete this ${
                              isGroup ? "group" : "chat"
                            }? All messages will be permanently deleted.`
                          )
                        ) {
                          handleDeleteConversation(activeConversation._id);
                        }
                      }}
                      className="p-1.5 sm:p-2 rounded-full text-[#aebac1] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </header>

              {/* In-Chat Search Bar Drawer */}
              {isInChatSearchOpen && (
                <div className="flex items-center gap-2 px-6 py-2 bg-[#202c33] border-b border-[#222e35] animate-in slide-in-from-top-2 duration-150">
                  <Search className="w-4 h-4 text-[#8696a0] flex-shrink-0" />
                  <input
                    type="text"
                    value={inChatSearchQuery}
                    onChange={(e) => setInChatSearchQuery(e.target.value)}
                    placeholder="Filter messages in this conversation..."
                    className="flex-1 bg-[#111b21] px-3 py-1.5 rounded-lg border border-[#2a3942] text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                    autoFocus
                  />
                  {inChatSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setInChatSearchQuery("")}
                      className="text-xs text-[#8696a0] hover:text-[#e9edef]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Message Feed & Right Contact Info Drawer Container */}
              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col h-full overflow-hidden">
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
                      onDeleteMessage={handleDeleteMessage}
                    />
                  </div>

                  {/* Message Composer Input */}
                  <MessageInput
                    conversationId={activeConversation._id}
                    onSendMessage={handleSendMessage}
                    droppedFiles={stagedDroppedFiles}
                  />
                </div>

                {/* WhatsApp Contact / Group Info Right Sidebar */}
                {isContactInfoOpen && (
                  <ContactInfoSidebar
                    isOpen={isContactInfoOpen}
                    onClose={() => setIsContactInfoOpen(false)}
                    conversation={activeConversation}
                    currentUser={currentUser}
                    isOtherUserOnline={isOtherUserOnline}
                    messages={messages}
                    onStartVoiceCall={handleStartVoiceCall}
                    onStartVideoCall={handleStartVideoCall}
                    onOpenSearch={() => setIsInChatSearchOpen(true)}
                    onOpenGroupSettings={() => setIsGroupSettingOpen(true)}
                    onClearChat={handleClearChat}
                    onDeleteChat={handleDeleteConversation}
                  />
                )}
              </div>
            </>
          ) : (
            /* WhatsApp Desktop Empty State matching screenshot */
            <WhatsAppEmptyState
              onSendDocument={() => setIsNewChatOpen(true)}
              onAddContact={() => setIsNewChatOpen(true)}
              onAskMetaAI={() => {
                setShowMetaAIChat(true);
                setActiveDockView("meta-ai");
              }}
            />
          )}
        </main>
      </div>

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

      {/* WhatsApp Desktop Settings Modal */}
      <WhatsAppSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onLogout={handleLogout}
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
