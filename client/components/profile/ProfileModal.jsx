"use client";

import { useState, useEffect } from "react";
import { updateUserProfile } from "../../services/userService";
import useAuthStore from "../../store/authStore";
import { getAvatarColor, getInitials } from "../../lib/utils";
import { X, User, Check, Loader2, Mail, AtSign } from "lucide-react";

export default function ProfileModal({ isOpen, onClose }) {
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setAvatar(currentUser.avatar || "");
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await updateUserProfile({
        name: name.trim(),
        avatar: avatar.trim(),
      });
      setUser({ ...currentUser, ...res.user });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl overflow-hidden text-[#e9edef] animate-in zoom-in-95 duration-150">
        {/* WhatsApp Signature Header */}
        <div className="flex items-center justify-between p-4 bg-[#202c33] border-b border-[#222e35] text-white">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[#00a884]" />
            <h2 className="text-base font-semibold">Profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar preview */}
        <div className="flex flex-col items-center pt-6 pb-2">
          <div className="relative">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#202c33]"
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full bg-[#534b3e] flex items-center justify-center text-white text-3xl font-bold shadow-sm ring-4 ring-[#202c33]`}
              >
                {getInitials(name || currentUser.name)}
              </div>
            )}
            <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#25d366] border-2 border-[#111b21]" />
          </div>
          <p className="mt-2 text-xs font-medium text-[#00a884] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25d366]" />
            Online
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1.5 uppercase tracking-wider">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-[#e9edef] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8696a0] mb-1.5 uppercase tracking-wider">
              Photo URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#202c33] border border-[#2a3942] text-sm text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-2 text-xs text-[#8696a0]">
            <div className="flex items-center gap-2">
              <AtSign className="w-3.5 h-3.5 text-[#8696a0]" />
              <span>Username: <strong className="text-[#e9edef]">@{currentUser.username}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#8696a0]" />
              <span>Email: <strong className="text-[#e9edef]">{currentUser.email}</strong></span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#222e35]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full hover:bg-[#202c33] text-sm font-medium text-[#8696a0] hover:text-[#e9edef] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-6 py-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-sm font-medium shadow-xs disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedSuccess ? (
                <Check className="w-4 h-4" />
              ) : null}
              <span>{savedSuccess ? "Saved!" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
