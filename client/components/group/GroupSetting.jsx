"use client";

import { useState, useEffect } from "react";
import {
  addGroupMembers,
  removeGroupMember,
  toggleAdminRole,
  updateGroupSettings,
} from "../../services/conversationService";
import { searchUsers, getAllUsers } from "../../services/userService";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import { getAvatarColor, getInitials, formatLiveLastSeen } from "../../lib/utils";
import {
  X,
  Users,
  Shield,
  UserMinus,
  UserPlus,
  LogOut,
  Edit2,
  Check,
  Loader2,
  Search,
} from "lucide-react";

export default function GroupSetting({ isOpen, onClose, conversation, onConversationUpdated }) {
  const currentUser = useAuthStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const removeConversation = useChatStore((state) => state.removeConversation);

  const [groupName, setGroupName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (conversation) {
      setGroupName(conversation.name || "");
    }
  }, [conversation]);

  // Search users to add (load all contacts immediately when opened, filter if query provided)
  useEffect(() => {
    if (!isAddingMembers) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingSearch(true);
        let res;
        if (searchQuery.trim()) {
          res = await searchUsers(searchQuery.trim());
        } else {
          res = await getAllUsers();
        }
        const existingMemberIds = new Set(
          (conversation.members || []).map((m) => (m._id || m.id || m).toString())
        );
        const filtered = (res.users || []).filter(
          (u) => !existingMemberIds.has((u._id || u.id).toString())
        );
        setSearchResults(filtered);
      } catch (err) {
        console.error("Search users error:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAddingMembers, searchQuery, conversation]);

  if (!isOpen || !conversation) return null;

  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const isAdmin = (conversation.admins || []).some(
    (a) => (a._id || a.id || a)?.toString() === currentUserId
  );

  const handleSaveName = async () => {
    if (!groupName.trim() || groupName === conversation.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setProcessing(true);
      const res = await updateGroupSettings(conversation._id, { name: groupName.trim() });
      updateConversation(res.conversation);
      if (onConversationUpdated) onConversationUpdated(res.conversation);
      setIsEditingName(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update group name");
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAddSelect = (userId) => {
    setSelectedToAdd((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddMembersSubmit = async () => {
    if (selectedToAdd.length === 0) return;

    try {
      setProcessing(true);
      const res = await addGroupMembers(conversation._id, selectedToAdd);
      updateConversation(res.conversation);
      if (onConversationUpdated) onConversationUpdated(res.conversation);
      setIsAddingMembers(false);
      setSelectedToAdd([]);
      setSearchQuery("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add members");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    const isSelf = targetUserId.toString() === currentUserId;
    if (!confirm(isSelf ? "Are you sure you want to leave this group?" : "Remove this member?")) {
      return;
    }

    try {
      setProcessing(true);
      const res = await removeGroupMember(conversation._id, targetUserId);
      if (isSelf) {
        removeConversation(conversation._id);
        onClose();
      } else {
        updateConversation(res.conversation);
        if (onConversationUpdated) onConversationUpdated(res.conversation);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAdmin = async (targetUserId, currentlyAdmin) => {
    try {
      setProcessing(true);
      const res = await toggleAdminRole(
        conversation._id,
        targetUserId,
        currentlyAdmin ? "member" : "admin"
      );
      updateConversation(res.conversation);
      if (onConversationUpdated) onConversationUpdated(res.conversation);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update admin role");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden text-[#e9edef] animate-in zoom-in-95 duration-150">
        {/* WhatsApp Signature Header */}
        <div className="flex items-center justify-between p-4 bg-[#202c33] border-b border-[#222e35] text-white">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold">Group Info</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {/* Group Icon & Name */}
          <div className="flex flex-col items-center pb-5 border-b border-[#222e35] text-center">
            <div
              className={`w-20 h-20 rounded-full bg-[#534b3e] flex items-center justify-center text-white text-2xl font-bold shadow-sm mb-3 ring-4 ring-[#202c33]`}
            >
              {conversation.avatar ? (
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Users className="w-10 h-10 text-white" />
              )}
            </div>

            {isEditingName ? (
              <div className="flex items-center gap-2 w-full max-w-xs mt-1">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#202c33] border border-[#00a884] text-sm text-[#e9edef] focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-2 rounded-lg bg-[#00a884] hover:bg-[#008069] text-white"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-[#e9edef]">{conversation.name}</h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-[#8696a0] hover:text-[#00a884] transition-colors"
                    title="Edit group name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-[#8696a0] mt-1">
              Group · {conversation.members?.length || 0} participants
            </p>
          </div>

          {/* Add Members Section */}
          {isAdmin && !isAddingMembers && (
            <div className="py-3">
              <button
                type="button"
                onClick={() => setIsAddingMembers(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#103629] hover:bg-[#154635] text-[#25d366] font-medium text-xs transition-colors border border-[#25d366]/20"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add participants</span>
              </button>
            </div>
          )}

          {isAddingMembers && (
            <div className="my-3 p-3.5 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#00a884]">Add Participants</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingMembers(false);
                    setSelectedToAdd([]);
                  }}
                  className="text-[#8696a0] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#8696a0]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#111b21] border border-[#2a3942] text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  autoFocus
                />
              </div>

              {loadingSearch ? (
                <div className="py-3 flex justify-center text-[#00a884]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {searchResults.map((user) => {
                    const isChecked = selectedToAdd.includes(user._id);
                    return (
                      <div
                        key={user._id}
                        onClick={() => handleToggleAddSelect(user._id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                          isChecked ? "bg-[#103629] text-[#25d366]" : "hover:bg-[#111b21] text-[#e9edef]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#534b3e] flex items-center justify-center font-bold text-[10px] text-white">
                            {getInitials(user.name)}
                          </div>
                          <span>{user.name}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? "bg-[#00a884] border-[#00a884]" : "border-[#8696a0]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-xs text-[#8696a0] py-2">
                  {searchQuery.trim()
                    ? `No contacts matching "${searchQuery}"`
                    : "All contacts are already members"}
                </p>
              )}

              {selectedToAdd.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddMembersSubmit}
                  disabled={processing}
                  className="w-full py-2 rounded-lg bg-[#00a884] hover:bg-[#008069] text-white text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  {processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add {selectedToAdd.length} Selected</span>
                </button>
              )}
            </div>
          )}

          {/* Member List */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
              {conversation.members?.length || 0} participants
            </h4>

            <div className="space-y-1">
              {(conversation.members || []).map((m, idx) => {
                const mId = (m._id || m.id || m)?.toString();
                const isMemberAdmin = (conversation.admins || []).some(
                  (a) => (a._id || a.id || a)?.toString() === mId
                );
                const isThisUser = mId === currentUserId;
                const isOnline = onlineUsers.some((id) => id?.toString() === mId);

                return (
                  <div
                    key={`${mId}-${idx}`}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#202c33] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {m.avatar ? (
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full bg-[#534b3e] flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {getInitials(m.name || "User")}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#111b21] ${
                            isOnline ? "bg-[#25d366]" : "bg-[#8696a0]"
                          }`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-[#e9edef]">
                            {m.name || "Participant"} {isThisUser && "(You)"}
                          </span>
                          {isMemberAdmin && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#103629] text-[#25d366] border border-[#25d366]/30">
                              <Shield className="w-2.5 h-2.5" />
                              Group Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#8696a0]">
                          {isOnline ? (
                            <span className="text-[#00a884] font-medium">online</span>
                          ) : (
                            formatLiveLastSeen(m.lastSeen)
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {isAdmin && !isThisUser && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleAdmin(mId, isMemberAdmin)}
                            title={isMemberAdmin ? "Dismiss as admin" : "Make group admin"}
                            className="p-1.5 rounded-lg hover:bg-[#2a3942] text-[#8696a0] hover:text-[#00a884] transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(mId)}
                            title="Remove from group"
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-[#8696a0] hover:text-rose-400 transition-colors"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {isThisUser && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(currentUserId)}
                          title="Exit group"
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Exit</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
