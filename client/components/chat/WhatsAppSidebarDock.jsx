"use client";

import {
  MessageSquare,
  Phone,
  CircleDot,
  Radio,
  Users,
  Archive,
  Star,
  Settings,
} from "lucide-react";
import { getAvatarColor, getInitials } from "../../lib/utils";

export default function WhatsAppSidebarDock({
  activeView = "chats", // 'chats' | 'calls' | 'status' | 'channels' | 'communities' | 'archived' | 'meta-ai'
  onSelectView,
  onOpenSettings,
  onOpenProfile,
  currentUser,
  unreadChatsCount = 0,
  missedCallsCount = 0,
}) {
  return (
    <div className="w-[54px] min-w-[54px] h-full bg-[#202c33] border-r border-[#222e35] flex flex-col justify-between items-center py-2 select-none z-20 flex-shrink-0">
      {/* Top Group: Main Navigation Icons */}
      <div className="flex flex-col items-center gap-1 w-full">
        {/* 1. Chats Icon with 84 badge */}
        <button
          type="button"
          onClick={() => onSelectView("chats")}
          title="Chats"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "chats"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <MessageSquare className="w-5 h-5 fill-current" />
          {unreadChatsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#25d366] text-[#111b21] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
            </span>
          )}
        </button>

        {/* 2. Calls Icon with 1 badge */}
        <button
          type="button"
          onClick={() => onSelectView("calls")}
          title="Calls"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "calls"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <Phone className="w-5 h-5" />
          {missedCallsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-[#25d366] text-[#111b21] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {missedCallsCount}
            </span>
          )}
        </button>

        {/* 3. Status Icon */}
        <button
          type="button"
          onClick={() => onSelectView("status")}
          title="Status"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "status"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <CircleDot className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#25d366]" />
        </button>

        {/* 4. Channels Icon */}
        <button
          type="button"
          onClick={() => onSelectView("channels")}
          title="Channels"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "channels"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <Radio className="w-5 h-5" />
        </button>

        {/* 5. Communities Icon */}
        <button
          type="button"
          onClick={() => onSelectView("communities")}
          title="Communities"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "communities"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <Users className="w-5 h-5" />
        </button>

        {/* 6. Archived Icon */}
        <button
          type="button"
          onClick={() => onSelectView("archived")}
          title="Archived"
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "archived"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <Archive className="w-5 h-5" />
        </button>

        {/* 7. Meta AI Icon (Purple glowing gradient ring matching screenshot) */}
        <button
          type="button"
          onClick={() => onSelectView("meta-ai")}
          title="Ask Meta AI (Dummy LLM)"
          className={`group relative w-10 h-10 rounded-full flex items-center justify-center transition-all mt-1 ${
            activeView === "meta-ai"
              ? "ring-2 ring-purple-400 bg-purple-950/40"
              : "hover:scale-105"
          }`}
        >
          <div className="w-7 h-7 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 group-hover:rotate-45 transition-transform duration-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400 animate-pulse" />
            </div>
          </div>
        </button>
      </div>

      {/* Bottom Group: Starred, Profile, Settings */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Starred Messages */}
        <button
          type="button"
          onClick={() => onSelectView("starred")}
          title="Starred messages"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            activeView === "starred"
              ? "bg-[#374248] text-[#00a884]"
              : "text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db]"
          }`}
        >
          <Star className="w-5 h-5" />
        </button>

        {/* Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db] transition-all"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* User Profile Avatar with Initials "K" or custom image */}
        <button
          type="button"
          onClick={onOpenProfile}
          title={currentUser?.name || "Profile"}
          className="relative w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-[#00a884] transition-all"
        >
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className={`w-full h-full bg-[#534b3e] flex items-center justify-center text-[#e9edef] font-semibold text-xs`}
            >
              {getInitials(currentUser?.name || "Khan shamshad")}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25d366] border border-[#202c33]" />
        </button>
      </div>
    </div>
  );
}
