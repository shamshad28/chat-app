"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import ConversationItem from "./ConversationItem";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import {
  Search,
  Plus,
  MoreVertical,
  ChevronDown,
  Loader2,
  Users,
  Settings,
  Star,
  LogOut,
  X,
} from "lucide-react";

export default function ConversationList({
  onSelectConversation,
  onOpenNewChat,
  onOpenNewGroup,
  onOpenSettings,
  onOpenMetaAI,
  onLogout,
}) {
  const [filterQuery, setFilterQuery] = useState("");
  const [activePill, setActivePill] = useState("all"); // 'all' | 'unread' | 'favourites'
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const conversations = useChatStore((state) => state.conversations);
  const activeConversation = useChatStore((state) => state.activeConversation);
  const loadingConversations = useChatStore((state) => state.loadingConversations);
  const currentUser = useAuthStore((state) => state.user);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Count how many conversations actually have unread messages
  const totalUnreadConversations = useMemo(() => {
    return (conversations || []).filter((c) => (Number(c.unreadCount) || 0) > 0).length;
  }, [conversations]);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let list = [...(conversations || [])];

    // Filter by Pill
    if (activePill === "unread") {
      list = list.filter((conv) => (Number(conv.unreadCount) || 0) > 0);
    } else if (activePill === "favourites") {
      list = list.filter((conv) => conv.isPinned || conv.isFavourite);
    }

    // Filter by Query
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      list = list.filter((conv) => {
        if (conv.name?.toLowerCase().includes(q)) return true;
        return (conv.members || []).some(
          (m) =>
            m.name?.toLowerCase().includes(q) ||
            m.username?.toLowerCase().includes(q)
        );
      });
    }

    // Sort: Pinned first (e.g. Khan shamshad (You)), then by updatedAt
    list.sort((a, b) => {
      const aPinned = a.name?.includes("shamshad") || a.isPinned;
      const bPinned = b.name?.includes("shamshad") || b.isPinned;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    return list;
  }, [conversations, activePill, filterQuery]);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-[#e9edef] select-none border-r border-[#222e35]">
      {/* Top Header: Title "Chats", 3-Dots Menu, Vibrant Green "+" New Chat Button */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-[#e9edef]">
          Chats
        </h1>

        <div className="flex items-center gap-1.5 relative">
          {/* 3-dots Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Menu"
              className="p-2 rounded-full text-[#aebac1] hover:text-[#e9edef] hover:bg-[#202c33] transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* WhatsApp Desktop Context Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-10 w-48 py-1.5 rounded-xl bg-[#233138] border border-[#2a3942] shadow-2xl z-50 text-xs text-[#d1d7db] animate-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenNewGroup();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#182229] hover:text-white flex items-center gap-2.5"
                >
                  <Users className="w-4 h-4 text-[#8696a0]" />
                  <span>New group</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#182229] hover:text-white flex items-center gap-2.5"
                >
                  <Settings className="w-4 h-4 text-[#8696a0]" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setActivePill("favourites");
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#182229] hover:text-white flex items-center gap-2.5"
                >
                  <Star className="w-4 h-4 text-[#8696a0]" />
                  <span>Starred messages</span>
                </button>
                <div className="border-t border-[#2a3942] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>

          {/* New Chat Button: Solid Green Circle with White Plus (Exact match to screenshot!) */}
          <button
            type="button"
            onClick={onOpenNewChat}
            title="New chat"
            className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#8696a0] pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search or start a new chat"
            className="w-full pl-10 pr-8 py-1.5 rounded-lg bg-[#202c33] text-xs text-[#d1d7db] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]/80 transition-all border border-transparent focus:border-[#222e35]"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery("")}
              className="absolute right-2.5 text-[#8696a0] hover:text-[#d1d7db]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills matching Screenshot: All, Unread 115, Favourites, Chevron down */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#222e35]/60 overflow-x-auto no-scrollbar">
        {/* All Pill */}
        <button
          type="button"
          onClick={() => setActivePill("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            activePill === "all"
              ? "bg-[#103629] text-[#25d366]"
              : "bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942]"
          }`}
        >
          All
        </button>

        {/* Unread Pill */}
        <button
          type="button"
          onClick={() => setActivePill(activePill === "unread" ? "all" : "unread")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activePill === "unread"
              ? "bg-[#103629] text-[#25d366]"
              : "bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942]"
          }`}
        >
          <span>Unread</span>
          {totalUnreadConversations > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-[#25d366]/20 text-[#25d366]">
              {totalUnreadConversations}
            </span>
          )}
        </button>

        {/* Favourites Pill */}
        <button
          type="button"
          onClick={() => setActivePill(activePill === "favourites" ? "all" : "favourites")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            activePill === "favourites"
              ? "bg-[#103629] text-[#25d366]"
              : "bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942]"
          }`}
        >
          Favourites
        </button>

        {/* Dropdown / Filter Chevron */}
        <button
          type="button"
          title="More filters"
          className="p-1.5 rounded-full bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942] transition-colors ml-auto"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
        {loadingConversations ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#00a884]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-xs text-[#8696a0] mt-2">Loading chats...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-16 px-4 text-center text-[#8696a0]">
            <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center mx-auto mb-2 text-xl">
              💬
            </div>
            <p className="text-sm font-medium text-[#e9edef]">No chats found</p>
            <p className="text-xs text-[#8696a0] mt-1">
              {filterQuery ? "Try searching another contact or message" : "Click '+' to start a new chat!"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation, idx) => (
            <ConversationItem
              key={`${conversation._id || idx}`}
              conversation={conversation}
              isSelected={activeConversation?._id === conversation._id}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>
    </div>
  );
}
