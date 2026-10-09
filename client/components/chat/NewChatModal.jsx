"use client";

import { useState, useEffect } from "react";
import { searchUsers, getAllUsers } from "../../services/userService";
import { createDirectConversation } from "../../services/conversationService";
import useChatStore from "../../store/chatStore";
import { getAvatarColor, getInitials, formatLiveLastSeen } from "../../lib/utils";
import { X, Search, Loader2, MessageSquarePlus } from "lucide-react";

export default function NewChatModal({ isOpen, onClose, onSelectConversation }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const addConversation = useChatStore((state) => state.addConversation);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);
        if (query.trim()) {
          const res = await searchUsers(query.trim());
          setUsers(res.users || []);
        } else {
          const res = await getAllUsers();
          setUsers(res.users || []);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [isOpen, query]);

  if (!isOpen) return null;

  const handleStartChat = async (targetUser) => {
    try {
      setCreating(true);
      const res = await createDirectConversation(targetUser._id || targetUser.id);
      if (res.conversation) {
        addConversation(res.conversation);
        onSelectConversation(res.conversation);
        onClose();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start conversation");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden text-[#e9edef] animate-in zoom-in-95 duration-150">
        {/* WhatsApp Signature Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#202c33] border-b border-[#222e35] text-white">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold">New Chat</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Search input */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8696a0]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, username or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#202c33] text-sm text-[#e9edef] placeholder-[#8696a0] border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              autoFocus
            />
          </div>

          {/* Users list */}
          <div className="max-h-72 overflow-y-auto divide-y divide-[#222e35]/60 scrollbar-thin">
            {loading ? (
              <div className="py-8 flex justify-center text-[#00a884]">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#8696a0]">
                {query ? "No users matching your search." : "No other users found."}
              </p>
            ) : (
              users.map((u, idx) => {
                const uId = (u._id || u.id)?.toString();
                const isOnline = onlineUsers.some((id) => id?.toString() === uId);

                return (
                  <div
                    key={`${u._id}-${idx}`}
                    onClick={() => handleStartChat(u)}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-[#202c33] cursor-pointer rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-[#222e35]"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full bg-[#534b3e] flex items-center justify-center font-bold text-white text-xs shadow-xs`}
                          >
                            {getInitials(u.name)}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#111b21] ${
                            isOnline ? "bg-[#25d366]" : "bg-[#8696a0]"
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-[#e9edef] truncate">{u.name}</p>
                        <p className="text-xs text-[#8696a0] truncate flex items-center gap-1.5">
                          <span>@{u.username}</span>
                          <span>•</span>
                          {isOnline ? (
                            <span className="text-[#00a884] font-medium">online</span>
                          ) : (
                            <span>{formatLiveLastSeen(u.lastSeen)}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={creating}
                      className="px-3.5 py-1.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-xs font-medium transition-all shadow-xs"
                    >
                      Chat
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
