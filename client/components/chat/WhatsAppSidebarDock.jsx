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
  showMobileBar = true,
}) {
  return (
    <>
      {/* 1. Desktop Left Dock Bar */}
      <div className="hidden md:flex w-[54px] min-w-[54px] h-full bg-[#202c33] border-r border-[#222e35] flex-col justify-between items-center py-2 select-none z-20 flex-shrink-0">
        {/* Top Group: Main Navigation Icons */}
        <div className="flex flex-col items-center gap-1 w-full">
          {/* Chats Icon */}
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

          {/* Calls Icon */}
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

          {/* Status Icon */}
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

          {/* Channels Icon */}
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

          {/* Communities Icon */}
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

          {/* Archived Icon */}
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

          {/* Meta AI Icon */}
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

        {/* Bottom Group: Starred, Settings, Profile */}
        <div className="flex flex-col items-center gap-2 w-full">
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

          <button
            type="button"
            onClick={onOpenSettings}
            title="Settings"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#aebac1] hover:bg-[#2a3942] hover:text-[#d1d7db] transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>

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
              <div className="w-full h-full bg-[#534b3e] flex items-center justify-center text-[#e9edef] font-semibold text-xs">
                {getInitials(currentUser?.name || "Khan shamshad")}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#25d366] border border-[#202c33]" />
          </button>
        </div>
      </div>

      {/* 2. Mobile Responsive Bottom Navigation Bar (WhatsApp Mobile Style) */}
      {showMobileBar && (
        <nav
          aria-label="Mobile Navigation"
          className="flex md:hidden fixed bottom-0 left-0 right-0 h-[56px] bg-[#202c33] border-t border-[#222e35] items-center justify-around px-2 z-30 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.4)]"
        >
          {/* Chats */}
          <button
            type="button"
            onClick={() => onSelectView("chats")}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeView === "chats"
                ? "text-[#00a884]"
                : "text-[#aebac1] hover:text-[#d1d7db]"
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 fill-current" />
              {unreadChatsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 bg-[#25d366] text-[#111b21] text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadChatsCount > 99 ? "99+" : unreadChatsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">Chats</span>
          </button>

          {/* Status */}
          <button
            type="button"
            onClick={() => onSelectView("status")}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeView === "status"
                ? "text-[#00a884]"
                : "text-[#aebac1] hover:text-[#d1d7db]"
            }`}
          >
            <div className="relative">
              <CircleDot className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#25d366]" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">Updates</span>
          </button>

          {/* Communities */}
          <button
            type="button"
            onClick={() => onSelectView("communities")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeView === "communities"
                ? "text-[#00a884]"
                : "text-[#aebac1] hover:text-[#d1d7db]"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Communities</span>
          </button>

          {/* Calls */}
          <button
            type="button"
            onClick={() => onSelectView("calls")}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeView === "calls"
                ? "text-[#00a884]"
                : "text-[#aebac1] hover:text-[#d1d7db]"
            }`}
          >
            <div className="relative">
              <Phone className="w-5 h-5" />
              {missedCallsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-[#25d366] text-[#111b21] text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {missedCallsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-0.5">Calls</span>
          </button>

          {/* Meta AI */}
          <button
            type="button"
            onClick={() => onSelectView("meta-ai")}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeView === "meta-ai"
                ? "text-purple-400"
                : "text-[#aebac1] hover:text-[#d1d7db]"
            }`}
          >
            <div className="w-5 h-5 rounded-full p-[1px] bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400">
              <div className="w-full h-full rounded-full bg-[#111b21] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-indigo-400" />
              </div>
            </div>
            <span className="text-[10px] font-medium mt-0.5">Meta AI</span>
          </button>

          {/* Settings / Profile */}
          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all text-[#aebac1] hover:text-[#d1d7db]`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium mt-0.5">Settings</span>
          </button>
        </nav>
      )}
    </>
  );
}
