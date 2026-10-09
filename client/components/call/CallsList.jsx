"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Phone,
  Video,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Link2,
  Plus,
  Search,
  X,
  Clock,
  User,
  Users,
  Check,
  ChevronRight,
} from "lucide-react";
import { getInitials, formatMessageTime } from "../../lib/utils";

const INITIAL_CALL_HISTORY = [
  {
    id: "call-1",
    contactName: "Priya Mali",
    contactUsername: "priyamali",
    avatar: null,
    type: "video", // 'voice' | 'video'
    direction: "outgoing", // 'incoming' | 'outgoing' | 'missed'
    status: "answered",
    duration: "14m 20s",
    timestamp: "Today, 10:15 AM",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-2",
    contactName: "Vaibhav Bhai Nexcore",
    contactUsername: "vaibhav",
    avatar: null,
    type: "voice",
    direction: "missed",
    status: "missed",
    duration: "0s",
    timestamp: "Today, 9:20 AM",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-3",
    contactName: "Khan family",
    contactUsername: "family",
    avatar: null,
    type: "video",
    direction: "incoming",
    status: "answered",
    duration: "25m 04s",
    timestamp: "Yesterday, 8:40 PM",
    isGroup: true,
    createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-4",
    contactName: "Afreen Khan",
    contactUsername: "afreen",
    avatar: null,
    type: "voice",
    direction: "incoming",
    status: "answered",
    duration: "6m 12s",
    timestamp: "Yesterday, 4:10 PM",
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-5",
    contactName: "Muaz Theem",
    contactUsername: "muaztheem",
    avatar: null,
    type: "voice",
    direction: "outgoing",
    status: "answered",
    duration: "1m 45s",
    timestamp: "Oct 7, 6:30 PM",
    createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-6",
    contactName: "HR Anjali",
    contactUsername: "anjali",
    avatar: null,
    type: "voice",
    direction: "missed",
    status: "missed",
    duration: "0s",
    timestamp: "Oct 6, 11:15 AM",
    createdAt: new Date(Date.now() - 65 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "call-7",
    contactName: "Shadab Nexa Core",
    contactUsername: "shadab",
    avatar: null,
    type: "video",
    direction: "outgoing",
    status: "answered",
    duration: "18m 55s",
    timestamp: "Oct 5, 3:20 PM",
    createdAt: new Date(Date.now() - 90 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CallsList({
  onStartVoiceCall,
  onStartVideoCall,
  onSelectContactForChat,
  conversations = [],
}) {
  const [calls, setCalls] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wa_call_history");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_CALL_HISTORY;
  });

  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'missed'
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedCallDetail, setSelectedCallDetail] = useState(null);
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wa_call_history", JSON.stringify(calls));
    }
  }, [calls]);

  const filteredCalls = useMemo(() => {
    let list = [...calls];
    if (activeFilter === "missed") {
      list = list.filter((c) => c.direction === "missed");
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) =>
        c.contactName?.toLowerCase().includes(q) ||
        c.contactUsername?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [calls, activeFilter, searchQuery]);

  const handleCreateCallLink = () => {
    const link = `${window.location.origin}/chat?call_link=wa-${Date.now()}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCallUser = (callItem, isVideo = false) => {
    // Look up conversation or user
    const matchingConv = conversations.find(
      (c) =>
        c.name === callItem.contactName ||
        (c.members || []).some(
          (m) => m.name === callItem.contactName || m.username === callItem.contactUsername
        )
    );

    const userObj = matchingConv
      ? matchingConv.type === "direct"
        ? matchingConv.members?.find((m) => m.name === callItem.contactName) || matchingConv.members?.[0]
        : matchingConv
      : {
          name: callItem.contactName,
          username: callItem.contactUsername,
          avatar: callItem.avatar,
        };

    // Log call entry
    const newEntry = {
      id: `call-${Date.now()}`,
      contactName: callItem.contactName,
      contactUsername: callItem.contactUsername,
      avatar: callItem.avatar,
      type: isVideo ? "video" : "voice",
      direction: "outgoing",
      status: "answered",
      duration: "Just now",
      timestamp: "Just now",
      createdAt: new Date().toISOString(),
    };
    setCalls((prev) => [newEntry, ...prev]);

    if (isVideo) {
      if (onStartVideoCall) onStartVideoCall(userObj);
    } else {
      if (onStartVoiceCall) onStartVoiceCall(userObj);
    }
  };

  const handleClearHistory = () => {
    if (confirm("Clear your entire call log?")) {
      setCalls([]);
      localStorage.removeItem("wa_call_history");
      setSelectedCallDetail(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-[#e9edef] select-none border-r border-[#222e35]">
      {/* 1. Header: Calls Title, Search, and New Call Button */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-[#e9edef]">Calls</h1>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsNewCallModalOpen(true)}
            title="Start a new call"
            className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Search Bar */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-[#8696a0] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search call logs"
            className="w-full pl-10 pr-8 py-1.5 rounded-lg bg-[#202c33] text-xs text-[#d1d7db] placeholder-[#8696a0] focus:outline-none focus:ring-1 focus:ring-[#00a884]/80 transition-all border border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-[#8696a0] hover:text-[#d1d7db]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Filter Pills: All / Missed */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#222e35]/60">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            activeFilter === "all"
              ? "bg-[#103629] text-[#25d366]"
              : "bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942]"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter("missed")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === "missed"
              ? "bg-[#103629] text-[#25d366]"
              : "bg-[#202c33] text-[#8696a0] hover:text-[#d1d7db] hover:bg-[#2a3942]"
          }`}
        >
          <span>Missed</span>
          {calls.filter((c) => c.direction === "missed").length > 0 && (
            <span className="text-[11px] font-bold text-rose-400">
              {calls.filter((c) => c.direction === "missed").length}
            </span>
          )}
        </button>

        {calls.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="ml-auto text-[11px] text-[#8696a0] hover:text-rose-400 transition-colors"
          >
            Clear log
          </button>
        )}
      </div>

      {/* 4. Call History Feed */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
        {/* Create Call Link Banner */}
        <div
          onClick={handleCreateCallLink}
          className="flex items-center gap-3 px-3 py-3 hover:bg-[#202c33] cursor-pointer transition-colors"
        >
          <div className="w-11 h-11 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <Link2 className="w-5 h-5 -rotate-45" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm text-[#e9edef] flex items-center gap-2">
              <span>Create call link</span>
              {copiedLink && (
                <span className="text-[10px] text-[#25d366] font-normal flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Copied link
                </span>
              )}
            </div>
            <p className="text-xs text-[#8696a0] truncate mt-0.5">
              Share a link for your WhatsApp call
            </p>
          </div>
        </div>

        <div className="px-3 py-2 text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider bg-[#111b21]">
          Recent
        </div>

        {filteredCalls.length === 0 ? (
          <div className="py-16 px-4 text-center text-[#8696a0]">
            <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center mx-auto mb-2 text-xl">
              📞
            </div>
            <p className="text-sm font-medium text-[#e9edef]">No calls found</p>
            <p className="text-xs text-[#8696a0] mt-1">
              {searchQuery ? "Try searching another contact name" : "To start a call, select a contact or click '+'"}
            </p>
          </div>
        ) : (
          filteredCalls.map((call) => {
            const isMissed = call.direction === "missed";
            const isVideo = call.type === "video";

            return (
              <div
                key={call.id}
                onClick={() => setSelectedCallDetail(call)}
                className={`flex items-center justify-between px-3 py-2.5 hover:bg-[#202c33] cursor-pointer transition-colors ${
                  selectedCallDetail?.id === call.id ? "bg-[#2a3942]" : ""
                }`}
              >
                {/* Left: Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  {call.avatar ? (
                    <img
                      src={call.avatar}
                      alt={call.contactName}
                      className="w-11 h-11 rounded-full object-cover ring-1 ring-[#222e35]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#534b3e] flex items-center justify-center text-[#e9edef] font-semibold text-sm shadow-xs">
                      {call.isGroup ? <Users className="w-5 h-5 text-[#d1d7db]" /> : getInitials(call.contactName)}
                    </div>
                  )}
                </div>

                {/* Middle: Name, Direction Arrow, Timestamp */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium truncate ${
                      isMissed ? "text-rose-400" : "text-[#e9edef]"
                    }`}
                  >
                    {call.contactName}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs text-[#8696a0] mt-0.5">
                    {/* Call Direction Indicator Arrow */}
                    {isMissed ? (
                      <PhoneMissed className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                    ) : call.direction === "incoming" ? (
                      <PhoneIncoming className="w-3.5 h-3.5 text-[#25d366] flex-shrink-0" />
                    ) : (
                      <PhoneOutgoing className="w-3.5 h-3.5 text-[#25d366] flex-shrink-0" />
                    )}

                    <span className="truncate">{call.timestamp}</span>
                    {call.duration && call.duration !== "0s" && (
                      <span className="text-[10px] text-[#8696a0]/70">({call.duration})</span>
                    )}
                  </div>
                </div>

                {/* Right: Quick Call Trigger Icons */}
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallUser(call, false);
                    }}
                    title="Voice call"
                    className="p-2 rounded-full text-[#00a884] hover:bg-[#2a3942] active:scale-95 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCallUser(call, true);
                    }}
                    title="Video call"
                    className="p-2 rounded-full text-[#00a884] hover:bg-[#2a3942] active:scale-95 transition-all"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Call Detail Popup / Modal Drawer */}
      {selectedCallDetail && (
        <div className="p-4 bg-[#202c33] border-t border-[#222e35] animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
              Call Details
            </span>
            <button
              type="button"
              onClick={() => setSelectedCallDetail(null)}
              className="text-[#8696a0] hover:text-[#e9edef]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm text-white">
                {selectedCallDetail.contactName}
              </div>
              <div className="text-xs text-[#8696a0]">
                {selectedCallDetail.type === "video" ? "Video call" : "Voice call"} • {selectedCallDetail.timestamp}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCallUser(selectedCallDetail, false)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#008069] hover:bg-[#00a884] text-white text-xs font-medium"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>
              <button
                type="button"
                onClick={() => handleCallUser(selectedCallDetail, true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2a3942] hover:bg-[#374248] text-[#00a884] text-xs font-medium border border-[#2a3942]"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Start New Call Modal */}
      {isNewCallModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[#111b21] border border-[#222e35] p-5 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-base text-white">New Call</h3>
              <button
                type="button"
                onClick={() => setIsNewCallModalOpen(false)}
                className="text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#8696a0] mb-3">
              Select a contact to start a high-definition encrypted call:
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-[#222e35] space-y-1">
              {(conversations || []).map((conv) => {
                const title = conv.name || conv.members?.map((m) => m.name).join(", ") || "Chat";
                return (
                  <div
                    key={conv._id}
                    className="flex items-center justify-between py-2 px-1 hover:bg-[#202c33] rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="text-xs font-medium text-[#e9edef] truncate max-w-[180px]">
                      {title}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewCallModalOpen(false);
                          handleCallUser({ contactName: title }, false);
                        }}
                        className="p-1.5 rounded-full text-[#00a884] hover:bg-[#2a3942]"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewCallModalOpen(false);
                          handleCallUser({ contactName: title }, true);
                        }}
                        className="p-1.5 rounded-full text-[#00a884] hover:bg-[#2a3942]"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
