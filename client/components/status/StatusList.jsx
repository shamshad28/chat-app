"use client";

import { useState, useEffect } from "react";
import {
  CircleDot,
  Plus,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  MoreVertical,
} from "lucide-react";
import { getInitials } from "../../lib/utils";

const INITIAL_STATUSES = [
  {
    id: "st-1",
    contactName: "Afreen Khan",
    contactUsername: "afreen",
    avatar: null,
    caption: "Family weekend trip! 🌄 Such a beautiful view.",
    mediaUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=60",
    timestamp: "38 minutes ago",
    viewed: false,
  },
  {
    id: "st-2",
    contactName: "Priya Mali",
    contactUsername: "priyamali",
    avatar: null,
    caption: "Coffee & Code ☕💻 Sprint goals progressing smoothly!",
    mediaUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&auto=format&fit=crop&q=60",
    timestamp: "Today, 9:45 AM",
    viewed: false,
  },
  {
    id: "st-3",
    contactName: "Vaibhav Bhai Nexcore",
    contactUsername: "vaibhav",
    avatar: null,
    caption: "New workstation setup completed! 🚀",
    mediaUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=60",
    timestamp: "Today, 8:12 AM",
    viewed: false,
  },
  {
    id: "st-4",
    contactName: "Muaz Theem",
    contactUsername: "muaztheem",
    avatar: null,
    caption: "Eid Mubarak preparations underway ✨",
    mediaUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&auto=format&fit=crop&q=60",
    timestamp: "Yesterday, 10:30 PM",
    viewed: true,
  },
];

export default function StatusList({ currentUser, onSendReply }) {
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);
  const [activeStory, setActiveStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [myStatus, setMyStatus] = useState({
    caption: "Available on WhatsApp",
    timestamp: "Today, 7:00 AM",
  });
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [newStatusText, setNewStatusText] = useState("");

  // Story auto-advance timer
  useEffect(() => {
    if (!activeStory) {
      setStoryProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Advance to next unviewed status or close
          const currentIdx = statuses.findIndex((s) => s.id === activeStory.id);
          if (currentIdx < statuses.length - 1) {
            setActiveStory(statuses[currentIdx + 1]);
            return 0;
          } else {
            setActiveStory(null);
            return 0;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeStory, statuses]);

  const handleOpenStory = (statusItem) => {
    setActiveStory(statusItem);
    setStoryProgress(0);
    // Mark as viewed
    setStatuses((prev) =>
      prev.map((s) => (s.id === statusItem.id ? { ...s, viewed: true } : s))
    );
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeStory) return;
    if (onSendReply) {
      onSendReply(activeStory.contactName, `Replying to status: "${activeStory.caption}"\n\n${replyText}`);
    }
    alert(`Reply sent to ${activeStory.contactName}: "${replyText}"`);
    setReplyText("");
    setActiveStory(null);
  };

  const handleAddStatus = (e) => {
    e.preventDefault();
    if (!newStatusText.trim()) return;
    setMyStatus({
      caption: newStatusText.trim(),
      timestamp: "Just now",
    });
    setNewStatusText("");
    setIsAddStatusOpen(false);
  };

  const recentStatuses = statuses.filter((s) => !s.viewed);
  const viewedStatuses = statuses.filter((s) => s.viewed);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-[#e9edef] select-none border-r border-[#222e35]">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-[#e9edef]">Status</h1>
        <button
          type="button"
          onClick={() => setIsAddStatusOpen(true)}
          title="Add status update"
          className="w-8 h-8 rounded-full bg-[#00a884] hover:bg-[#008069] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. Scrollable Status List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
        {/* My Status */}
        <div
          onClick={() => setIsAddStatusOpen(true)}
          className="flex items-center gap-3 px-3 py-3 hover:bg-[#202c33] cursor-pointer transition-colors"
        >
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#534b3e] flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(currentUser?.name || "Khan shamshad")
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#00a884] border-2 border-[#111b21] flex items-center justify-center text-white text-[10px] font-bold">
              +
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-[#e9edef]">My status</div>
            <p className="text-xs text-[#8696a0] truncate mt-0.5">
              {myStatus.caption} • {myStatus.timestamp}
            </p>
          </div>
        </div>

        {/* Recent Updates */}
        {recentStatuses.length > 0 && (
          <div>
            <div className="px-3 py-2 text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider bg-[#111b21]">
              Recent updates
            </div>
            {recentStatuses.map((st) => (
              <div
                key={st.id}
                onClick={() => handleOpenStory(st)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] cursor-pointer transition-colors"
              >
                {/* Green Ring Avatar */}
                <div className="relative p-[2.5px] rounded-full border-2 border-[#25d366] flex-shrink-0 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-[#534b3e] flex items-center justify-center text-white font-bold text-xs">
                    {getInitials(st.contactName)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-white truncate">
                    {st.contactName}
                  </div>
                  <p className="text-xs text-[#8696a0] truncate mt-0.5">
                    {st.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Viewed Updates */}
        {viewedStatuses.length > 0 && (
          <div>
            <div className="px-3 py-2 text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider bg-[#111b21]">
              Viewed updates
            </div>
            {viewedStatuses.map((st) => (
              <div
                key={st.id}
                onClick={() => handleOpenStory(st)}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] cursor-pointer transition-colors opacity-75 hover:opacity-100"
              >
                {/* Gray Ring Avatar */}
                <div className="relative p-[2px] rounded-full border-2 border-[#8696a0]/50 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#534b3e] flex items-center justify-center text-white font-bold text-xs">
                    {getInitials(st.contactName)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[#d1d7db] truncate">
                    {st.contactName}
                  </div>
                  <p className="text-xs text-[#8696a0] truncate mt-0.5">
                    {st.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Fullscreen Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none animate-in fade-in duration-150">
          <div className="relative w-full max-w-md h-[90vh] max-h-[720px] rounded-2xl overflow-hidden bg-[#111b21] border border-[#2a3942] flex flex-col justify-between shadow-2xl">
            {/* Top Progress Bar */}
            <div className="absolute top-0 left-0 right-0 p-3 z-20 space-y-2 bg-gradient-to-b from-black/80 to-transparent">
              <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>

              {/* Story Header */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#534b3e] flex items-center justify-center text-xs font-bold ring-2 ring-[#00a884]">
                    {getInitials(activeStory.contactName)}
                  </div>
                  <div>
                    <div className="font-semibold text-xs sm:text-sm">{activeStory.contactName}</div>
                    <div className="text-[10px] text-white/70">{activeStory.timestamp}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Middle Media / Image */}
            <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#0c1317]">
              {activeStory.mediaUrl ? (
                <img
                  src={activeStory.mediaUrl}
                  alt={activeStory.caption}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-8 text-center text-lg font-medium text-white max-w-sm">
                  {activeStory.caption}
                </div>
              )}

              {/* Caption Overlay */}
              {activeStory.mediaUrl && (
                <div className="absolute bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center text-sm font-medium text-white">
                  {activeStory.caption}
                </div>
              )}
            </div>

            {/* Bottom Quick Reply */}
            <div className="p-3 bg-[#202c33] border-t border-[#222e35] z-20">
              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${activeStory.contactName}...`}
                  className="flex-1 bg-[#111b21] border border-[#2a3942] rounded-full px-4 py-2 text-xs text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="p-2 rounded-full bg-[#00a884] hover:bg-[#008069] text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Status Dialog */}
      {isAddStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[#111b21] border border-[#222e35] p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-base text-white">Add Status Update</h3>
              <button
                type="button"
                onClick={() => setIsAddStatusOpen(false)}
                className="text-[#8696a0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStatus} className="space-y-4">
              <textarea
                value={newStatusText}
                onChange={(e) => setNewStatusText(e.target.value)}
                placeholder="Type a status update for your contacts..."
                rows={3}
                className="w-full bg-[#202c33] border border-[#2a3942] rounded-xl p-3 text-sm text-white placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]"
                autoFocus
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStatusOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#8696a0] hover:bg-[#202c33]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newStatusText.trim()}
                  className="px-5 py-2 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold disabled:opacity-40"
                >
                  Post Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
