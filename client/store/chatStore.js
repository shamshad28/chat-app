import { create } from "zustand";

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  // typingMap: { [conversationId]: [ { _id, name, username } ] }
  typingMap: {},
  replyingTo: null,
  activeThreadMessage: null,

  loadingConversations: false,
  loadingMessages: false,
  loadingMoreMessages: false,
  hasMoreMessages: true,
  sendingMessage: false,
  socketConnected: false,

  setConversations: (conversations) => {
    // Deduplicate conversations by _id
    const seen = new Set();
    const unique = [];
    for (const c of conversations || []) {
      const id = c._id?.toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push(c);
      }
    }
    set({ conversations: unique });
  },

  addConversation: (conversation) =>
    set((state) => {
      const convId = conversation._id?.toString();
      const exists = state.conversations.some(
        (c) => c._id?.toString() === convId
      );
      if (exists) {
        return {
          conversations: state.conversations.map((c) =>
            c._id?.toString() === convId ? conversation : c
          ),
        };
      }
      return { conversations: [conversation, ...state.conversations] };
    }),

  updateConversation: (updated) =>
    set((state) => {
      const updatedId = updated._id?.toString();
      return {
        conversations: state.conversations.map((c) =>
          c._id?.toString() === updatedId ? { ...c, ...updated } : c
        ),
        activeConversation:
          state.activeConversation?._id?.toString() === updatedId
            ? { ...state.activeConversation, ...updated }
            : state.activeConversation,
      };
    }),

  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter(
        (c) => c._id?.toString() !== conversationId?.toString()
      ),
      activeConversation:
        state.activeConversation?._id?.toString() === conversationId?.toString()
          ? null
          : state.activeConversation,
    })),

  updateConversationLastMessage: (conversationId, message) =>
    set((state) => {
      const convId = conversationId?.toString();
      const convIndex = state.conversations.findIndex(
        (c) => c._id?.toString() === convId
      );
      if (convIndex === -1) return state;

      const updated = [...state.conversations];
      const target = {
        ...updated[convIndex],
        lastMessage: message,
        updatedAt: message.createdAt || new Date().toISOString(),
      };
      updated.splice(convIndex, 1);
      return { conversations: [target, ...updated] };
    }),

  setActiveConversation: (conversation) =>
    set({
      activeConversation: conversation,
      messages: [],
      hasMoreMessages: true,
      replyingTo: null,
    }),

  setMessages: (messages, hasMore = false) => {
    // Strictly deduplicate messages by _id or tempId
    const seen = new Set();
    const unique = [];
    for (const m of messages || []) {
      const id = (m._id || m.tempId)?.toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        unique.push(m);
      }
    }
    set({
      messages: unique,
      hasMoreMessages: hasMore,
    });
  },

  prependMessages: (olderMessages, hasMore = false) =>
    set((state) => {
      const existingIds = new Set(
        state.messages.map((m) => (m._id || m.tempId)?.toString())
      );
      const filtered = (olderMessages || []).filter((m) => {
        const id = (m._id || m.tempId)?.toString();
        if (id && !existingIds.has(id)) {
          existingIds.add(id);
          return true;
        }
        return false;
      });
      return {
        messages: [...filtered, ...state.messages],
        hasMoreMessages: hasMore,
      };
    }),

  addMessage: (message) =>
    set((state) => {
      const msgIdStr = (message._id || message.id)?.toString();
      const existingMsgIndex = state.messages.findIndex(
        (m) => m._id && m._id.toString() === msgIdStr
      );

      // Case 1: Message arriving to replace an optimistic placeholder (message.tempId present)
      if (message.tempId) {
        // If the real message is ALREADY in the messages array (e.g. arrived via socket first)
        if (existingMsgIndex !== -1) {
          // Simply remove the temporary placeholder to prevent duplicate
          return {
            messages: state.messages.filter((m) => m._id !== message.tempId),
          };
        }

        // Otherwise replace the temporary placeholder in place
        const tempIndex = state.messages.findIndex((m) => m._id === message.tempId);
        if (tempIndex !== -1) {
          const newMessages = [...state.messages];
          newMessages[tempIndex] = message;
          return { messages: newMessages };
        }
      }

      // Case 2: Message already exists by real _id (do not add again)
      if (existingMsgIndex !== -1) {
        return {
          messages: state.messages.map((m) =>
            m._id && m._id.toString() === msgIdStr
              ? { ...m, ...message, isOptimistic: false }
              : m
          ),
        };
      }

      // Case 3: Message is incoming from socket, check if an optimistic counterpart exists
      const senderId = (message.sender?._id || message.sender?.id || message.sender)?.toString();
      const matchingOptimisticIndex = state.messages.findIndex((m) => {
        if (!m.isOptimistic) return false;
        const mSenderId = (m.sender?._id || m.sender?.id || m.sender)?.toString();
        const mConvId = (m.conversation?._id || m.conversation)?.toString();
        const msgConvId = (message.conversation?._id || message.conversation)?.toString();
        return (
          mSenderId === senderId &&
          mConvId === msgConvId &&
          m.content === message.content
        );
      });

      if (matchingOptimisticIndex !== -1) {
        const newMessages = [...state.messages];
        newMessages[matchingOptimisticIndex] = message;
        return { messages: newMessages };
      }

      // Case 4: Brand new message - append
      return {
        messages: [...state.messages, message],
      };
    }),

  updateMessage: (updatedMessage) =>
    set((state) => {
      const targetId = updatedMessage._id?.toString();
      return {
        messages: state.messages.map((m) =>
          m._id?.toString() === targetId ? { ...m, ...updatedMessage } : m
        ),
      };
    }),

  deleteMessageInStore: (messageId) =>
    set((state) => ({
      messages: state.messages.filter(
        (m) => (m._id || m.tempId)?.toString() !== messageId?.toString()
      ),
    })),

  clearMessagesInStore: (conversationId) =>
    set((state) => {
      const isCurrentActive =
        state.activeConversation?._id?.toString() === conversationId?.toString();
      return {
        messages: isCurrentActive ? [] : state.messages,
        conversations: state.conversations.map((c) =>
          c._id?.toString() === conversationId?.toString()
            ? { ...c, lastMessage: null, unreadCount: 0 }
            : c
        ),
      };
    }),

  updateMessageReactions: (messageId, reactions) =>
    set((state) => {
      const targetId = messageId?.toString();
      return {
        messages: state.messages.map((m) =>
          m._id?.toString() === targetId ? { ...m, reactions } : m
        ),
      };
    }),

  markMessagesReadInStore: (conversationId, readerId) =>
    set((state) => {
      if (state.activeConversation?._id?.toString() !== conversationId?.toString()) {
        return state;
      }
      const readerIdStr = readerId?.toString();
      return {
        messages: state.messages.map((m) => {
          const readBy = m.readBy || [];
          if (!readBy.some((id) => (id?._id || id)?.toString() === readerIdStr)) {
            return {
              ...m,
              readBy: [...readBy, readerId],
              deliveredTo: [...(m.deliveredTo || []), readerId],
            };
          }
          return m;
        }),
      };
    }),

  // Presence
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  updateUserPresence: (userId, status, lastSeen) =>
    set((state) => {
      const userIdStr = userId?.toString();
      const current = new Set(state.onlineUsers);
      if (status === "online") {
        current.add(userIdStr);
      } else {
        current.delete(userIdStr);
      }

      const updateMembers = (members) =>
        (members || []).map((m) => {
          const mId = (m._id || m.id)?.toString();
          if (mId === userIdStr) {
            return {
              ...m,
              status,
              lastSeen: status === "online" ? null : (lastSeen || new Date().toISOString()),
            };
          }
          return m;
        });

      return {
        onlineUsers: Array.from(current),
        conversations: state.conversations.map((c) => ({
          ...c,
          members: updateMembers(c.members),
        })),
        activeConversation: state.activeConversation
          ? {
              ...state.activeConversation,
              members: updateMembers(state.activeConversation.members),
            }
          : null,
      };
    }),

  // Typing
  setUserTyping: (conversationId, user) =>
    set((state) => {
      const currentList = state.typingMap[conversationId] || [];
      const userExists = currentList.some(
        (u) => (u._id || u.id)?.toString() === (user._id || user.id)?.toString()
      );
      if (userExists) return state;
      return {
        typingMap: {
          ...state.typingMap,
          [conversationId]: [...currentList, user],
        },
      };
    }),

  removeUserTyping: (conversationId, userId) =>
    set((state) => {
      const currentList = state.typingMap[conversationId] || [];
      const filtered = currentList.filter(
        (u) => (u._id || u.id)?.toString() !== userId?.toString()
      );
      return {
        typingMap: {
          ...state.typingMap,
          [conversationId]: filtered,
        },
      };
    }),

  setReplyingTo: (replyingTo) => set({ replyingTo }),
  setActiveThreadMessage: (activeThreadMessage) => set({ activeThreadMessage }),

  setSocketConnected: (socketConnected) => set({ socketConnected }),
  setLoadingConversations: (loadingConversations) => set({ loadingConversations }),
  setLoadingMessages: (loadingMessages) => set({ loadingMessages }),
  setLoadingMoreMessages: (loadingMoreMessages) => set({ loadingMoreMessages }),
  setSendingMessage: (sendingMessage) => set({ sendingMessage }),
}));

export default useChatStore;