"use client";

import { useEffect, useRef } from "react";
import socket, { connectSocket } from "../lib/socket";
import useChatStore from "../store/chatStore";
import useAuthStore from "../store/authStore";
import { playNotificationSound } from "../lib/sound";
import { showDesktopNotification } from "../lib/notification";
import useNotificationStore from "../store/notificationStore";

export default function useSocket() {
  const user = useAuthStore((state) => state.user);
  const activeConversation = useChatStore((state) => state.activeConversation);

  const activeConvRef = useRef(activeConversation);
  activeConvRef.current = activeConversation;

  const userRef = useRef(user);
  userRef.current = user;

  const userId = (user?._id || user?.id)?.toString();

  useEffect(() => {
    if (!userRef.current) return;

    connectSocket(userRef.current);

    const handleConnect = () => {
      useChatStore.getState().setSocketConnected(true);
      socket.emit("setup", userRef.current);
      socket.emit("getOnlineUsers");

      if (activeConvRef.current?._id) {
        socket.emit("joinConversation", activeConvRef.current._id);
      }
    };

    const handleDisconnect = () => {
      useChatStore.getState().setSocketConnected(false);
    };

    const handleOnlineUsersList = (usersList) => {
      useChatStore.getState().setOnlineUsers(usersList);
    };

    const handlePresenceUpdate = ({ userId: pUserId, status, lastSeen }) => {
      useChatStore.getState().updateUserPresence(pUserId, status, lastSeen);
    };

    const handleNewMessage = (message) => {
      const convId =
        typeof message.conversation === "string"
          ? message.conversation
          : message.conversation?._id;

      const currentActiveId = activeConvRef.current?._id;
      const currentUserId = userRef.current?._id || userRef.current?.id;
      const senderId =
        typeof message.sender === "string"
          ? message.sender
          : message.sender?._id;

      const isCurrentChat = String(convId) === String(currentActiveId);
      const isFromMe = String(senderId) === String(currentUserId);

      if (isCurrentChat) {
        useChatStore.getState().addMessage(message);

        // If window is visible and active, mark as read
        if (!isFromMe && document.visibilityState === "visible") {
          socket.emit("markAsRead", {
            conversationId: convId,
            userId: currentUserId,
          });
        }
      }

      useChatStore.getState().updateConversationLastMessage(convId, message);

      // Audio & Desktop Notification if message is from someone else and not in current focus
      if (!isFromMe) {
        const isBackground = document.visibilityState === "hidden" || !isCurrentChat;
        if (isBackground) {
          playNotificationSound();
          const senderName = message.sender?.name || "New Message";
          const snippet =
            message.type === "image"
              ? "📷 Photo"
              : message.type === "video"
                ? "🎥 Video"
                : message.type === "document"
                  ? "📄 Document"
                  : message.content || "Sent an attachment";

          showDesktopNotification(senderName, snippet);

          // WhatsApp-style in-app toast banner
          useNotificationStore.getState().addNotification({
            title: senderName,
            body: snippet,
            avatar: message.sender?.avatar,
            conversationId: convId,
            type: message.type,
          });

          // Unread document title notification
          document.title = `• New message from ${senderName}`;
        }
      }
    };

    const handleMessageNotification = ({ conversationId, message, conversationName }) => {
      const currentActiveId = activeConvRef.current?._id;
      const currentUserId = userRef.current?._id || userRef.current?.id;
      const senderId =
        typeof message.sender === "string"
          ? message.sender
          : message.sender?._id;

      if (
        String(conversationId) !== String(currentActiveId) &&
        String(senderId) !== String(currentUserId)
      ) {
        playNotificationSound();
        const title = conversationName || message.sender?.name || "New Message";
        const snippet =
          message.type === "image"
            ? "📷 Photo"
            : message.type === "video"
              ? "🎥 Video"
              : message.type === "document"
                ? "📄 Document"
                : message.content || "Media";

        showDesktopNotification(title, `${message.sender?.name || "User"}: ${snippet}`);

        useNotificationStore.getState().addNotification({
          title,
          body: `${message.sender?.name || "User"}: ${snippet}`,
          avatar: message.sender?.avatar,
          conversationId,
          type: message.type,
        });

        document.title = `• New message from ${title}`;
      }
    };

    const handleMessagesRead = ({ conversationId, userId: readerId }) => {
      useChatStore.getState().markMessagesReadInStore(conversationId, readerId);
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      useChatStore.getState().updateMessageReactions(messageId, reactions);
    };

    const handleTypingStarted = ({ conversationId, user: typingUser }) => {
      useChatStore.getState().setUserTyping(conversationId, typingUser);
    };

    const handleTypingStopped = ({ conversationId, userId: typerId }) => {
      useChatStore.getState().removeUserTyping(conversationId, typerId);
    };

    const handleConversationNew = (conversation) => {
      useChatStore.getState().addConversation(conversation);
    };

    const handleGroupUpdated = (updatedGroup) => {
      useChatStore.getState().updateConversation(updatedGroup);
    };

    const handleGroupRemoved = ({ conversationId }) => {
      useChatStore.getState().removeConversation(conversationId);
    };

    const handleConversationDeleted = ({ conversationId }) => {
      useChatStore.getState().removeConversation(conversationId);
    };

    const handleConversationCleared = ({ conversationId }) => {
      useChatStore.getState().clearMessagesInStore(conversationId);
    };

    const handleMessageDeleted = ({ messageId }) => {
      useChatStore.getState().deleteMessageInStore(messageId);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("onlineUsers:list", handleOnlineUsersList);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("newMessage", handleNewMessage);
    socket.on("messageNotification", handleMessageNotification);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageReactionUpdated", handleReactionUpdated);
    socket.on("typing:started", handleTypingStarted);
    socket.on("typing:stopped", handleTypingStopped);
    socket.on("conversation:new", handleConversationNew);
    socket.on("group:updated", handleGroupUpdated);
    socket.on("group:removed", handleGroupRemoved);
    socket.on("conversation:deleted", handleConversationDeleted);
    socket.on("conversation:cleared", handleConversationCleared);
    socket.on("message:deleted", handleMessageDeleted);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("onlineUsers:list", handleOnlineUsersList);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("newMessage", handleNewMessage);
      socket.off("messageNotification", handleMessageNotification);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageReactionUpdated", handleReactionUpdated);
      socket.off("typing:started", handleTypingStarted);
      socket.off("typing:stopped", handleTypingStopped);
      socket.off("conversation:new", handleConversationNew);
      socket.off("group:updated", handleGroupUpdated);
      socket.off("group:removed", handleGroupRemoved);
      socket.off("conversation:deleted", handleConversationDeleted);
      socket.off("conversation:cleared", handleConversationCleared);
      socket.off("message:deleted", handleMessageDeleted);
    };
  }, [userId]);

  return { socket };
}
