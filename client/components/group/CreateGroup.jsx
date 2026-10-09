"use client";

import { useState, useEffect } from "react";
import { searchUsers, getAllUsers } from "../../services/userService";
import { createGroupConversation } from "../../services/conversationService";
import useChatStore from "../../store/chatStore";
import { getAvatarColor, getInitials, formatLiveLastSeen } from "../../lib/utils";
import { X, Users, Search, Loader2, Check } from "lucide-react";

export default function CreateGroup({ isOpen, onClose, onGroupCreated }) {
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

    const timer = setTimeout(fetchUsers, 250);
    return () => clearTimeout(timer);
  }, [isOpen, query]);

  if (!isOpen) return null;

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter a group name");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createGroupConversation({
        name: name.trim(),
        avatar: avatar.trim(),
        members: selectedUserIds,
      });

      if (res.conversation) {
        addConversation(res.conversation);
        onGroupCreated(res.conversation);
        onClose();
        setName("");
        setAvatar("");
        setSelectedUserIds([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden text-[#e9edef] animate-in zoom-in-95 duration-150">
        {/* WhatsApp Signature Header */}
        <div className="flex items-center justify-between p-4 bg-[#202c33] border-b border-[#222e35] text-white">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold">New Group</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCreate} className="p-5 space-y-4">
          {/* Group Name & Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1.5 uppercase tracking-wider">
              Group Subject *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Provide a group subject..."
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1.5 uppercase tracking-wider">
              Group Icon URL (Optional)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          {/* Members search & selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
                Add Participants ({selectedUserIds.length} selected)
              </label>
            </div>

            <div className="relative mb-2">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#8696a0]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search contact name or username..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#202c33] border border-[#2a3942] text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <div className="max-h-52 overflow-y-auto space-y-1 rounded-xl bg-[#202c33]/50 p-2 border border-[#2a3942] scrollbar-thin">
              {loading ? (
                <div className="py-6 flex justify-center text-[#00a884]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#8696a0]">No contacts found.</p>
              ) : (
                users.map((u, idx) => {
                  const isChecked = selectedUserIds.includes(u._id);
                  const isOnline = onlineUsers.some((id) => id?.toString() === u._id?.toString());
                  return (
                    <div
                      key={`${u._id}-${idx}`}
                      onClick={() => toggleSelectUser(u._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-[#103629] border border-[#25d366]/40"
                          : "hover:bg-[#202c33] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-9 h-9 rounded-full bg-[#534b3e] flex items-center justify-center font-bold text-white text-xs`}
                            >
                              {getInitials(u.name)}
                            </div>
                          )}
                          <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111b21] ${
                              isOnline ? "bg-[#25d366]" : "bg-[#8696a0]"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-[#e9edef]">{u.name}</p>
                          <p className="text-[11px] text-[#8696a0]">
                            {isOnline ? (
                              <span className="text-[#00a884] font-medium">online</span>
                            ) : (
                              formatLiveLastSeen(u.lastSeen)
                            )}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#00a884] border-[#00a884] text-white"
                            : "border-[#8696a0] bg-[#111b21]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222e35]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full hover:bg-[#202c33] text-sm font-medium text-[#8696a0] hover:text-[#e9edef] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim() || selectedUserIds.length < 1}
              className="px-6 py-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-sm font-medium shadow-xs disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
