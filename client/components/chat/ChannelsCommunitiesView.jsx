"use client";

import { useState } from "react";
import {
  Radio,
  Users,
  Archive,
  Star,
  Search,
  Check,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { getInitials } from "../../lib/utils";

const SAMPLE_CHANNELS = [
  {
    id: "ch-1",
    name: "WhatsApp Official",
    verified: true,
    followers: "128M followers",
    avatar: "https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=120&auto=format&fit=crop&q=60",
    lastUpdate: "New security & privacy features rolling out to all users this week.",
    time: "Yesterday",
    following: true,
  },
  {
    id: "ch-2",
    name: "Real Madrid C.F.",
    verified: true,
    followers: "42M followers",
    avatar: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=60",
    lastUpdate: "Matchday preparation in Madrid! ⚽ Hala Madrid!",
    time: "4h ago",
    following: false,
  },
  {
    id: "ch-3",
    name: "TechCrunch",
    verified: true,
    followers: "18M followers",
    avatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=60",
    lastUpdate: "AI advancements and developer tooling highlights for Q4.",
    time: "2h ago",
    following: true,
  },
  {
    id: "ch-4",
    name: "National Geographic",
    verified: true,
    followers: "31M followers",
    avatar: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=120&auto=format&fit=crop&q=60",
    lastUpdate: "Stunning photograph of the Aurora Borealis captured last night.",
    time: "1d ago",
    following: false,
  },
];

const SAMPLE_COMMUNITIES = [
  {
    id: "com-1",
    name: "Nexcore Tech Community",
    subgroups: ["General Announcements", "Frontend Guild", "DevOps & Cloud"],
    membersCount: 142,
    description: "Company-wide engineering discussion and announcements.",
  },
  {
    id: "com-2",
    name: "Muslim Community Falah",
    subgroups: ["Charity Drives", "Youth Forum", "Announcements"],
    membersCount: 380,
    description: "Local community volunteer network and charitable initiatives.",
  },
];

export default function ChannelsCommunitiesView({
  viewType = "channels", // 'channels' | 'communities' | 'archived' | 'starred'
  onSelectConversation,
  conversations = [],
}) {
  const [channels, setChannels] = useState(SAMPLE_CHANNELS);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFollow = (id) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, following: !c.following } : c))
    );
  };

  const titles = {
    channels: "Channels",
    communities: "Communities",
    archived: "Archived",
    starred: "Starred messages",
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-[#e9edef] select-none border-r border-[#222e35]">
      {/* 1. Header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <h1 className="text-xl font-bold tracking-tight text-[#e9edef]">
          {titles[viewType] || "Updates"}
        </h1>
      </div>

      {/* 2. CHANNELS VIEW */}
      {viewType === "channels" && (
        <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
          <div className="p-3 bg-[#202c33]/40 border-b border-[#222e35]">
            <p className="text-xs text-[#8696a0] leading-relaxed">
              Stay updated on topics you care about. Find channels to follow below.
            </p>
          </div>

          <div className="px-3 py-2 text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider bg-[#111b21]">
            Followed Channels
          </div>

          {channels.map((ch) => (
            <div
              key={ch.id}
              className="p-3.5 hover:bg-[#202c33] transition-colors flex items-start gap-3"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={ch.avatar}
                  alt={ch.name}
                  className="w-11 h-11 rounded-full object-cover ring-1 ring-[#222e35]"
                />
                {ch.verified && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00a884] text-white flex items-center justify-center text-[9px] font-bold border border-[#111b21]">
                    ✓
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-[#e9edef] truncate">
                    {ch.name}
                  </h4>
                  <span className="text-[11px] text-[#8696a0] flex-shrink-0">{ch.time}</span>
                </div>

                <p className="text-xs text-[#8696a0] line-clamp-2 mt-0.5 leading-relaxed">
                  {ch.lastUpdate}
                </p>

                <div className="flex items-center justify-between mt-2.5">
                  <span className="text-[11px] text-[#8696a0]">{ch.followers}</span>
                  <button
                    type="button"
                    onClick={() => toggleFollow(ch.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      ch.following
                        ? "bg-[#202c33] text-[#00a884] border border-[#2a3942] hover:border-rose-500/40 hover:text-rose-400"
                        : "bg-[#00a884] hover:bg-[#008069] text-white shadow-xs"
                    }`}
                  >
                    {ch.following ? "Following" : "+ Follow"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. COMMUNITIES VIEW */}
      {viewType === "communities" && (
        <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/40">
          <div className="p-4 bg-[#202c33]/40 border-b border-[#222e35]">
            <h3 className="text-sm font-semibold text-white mb-1">
              Introducing Communities
            </h3>
            <p className="text-xs text-[#8696a0] leading-relaxed">
              Easily organize your related groups and send announcements. Now, your communities like
              neighborhoods or workplaces can have their own space.
            </p>
          </div>

          {SAMPLE_COMMUNITIES.map((com) => (
            <div key={com.id} className="p-4 hover:bg-[#202c33] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#103629] text-[#25d366] flex items-center justify-center font-bold text-lg border border-[#25d366]/30">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#e9edef]">{com.name}</h4>
                  <span className="text-xs text-[#8696a0]">
                    {com.membersCount} members • {com.subgroups.length} groups
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#8696a0] mb-3">{com.description}</p>

              <div className="space-y-1 pl-4 border-l-2 border-[#2a3942]">
                {com.subgroups.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between py-1 text-xs text-[#d1d7db] hover:text-[#00a884] cursor-pointer"
                  >
                    <span>📣 {sub}</span>
                    <ArrowRight className="w-3 h-3 text-[#8696a0]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. ARCHIVED VIEW */}
      {viewType === "archived" && (
        <div className="flex-1 overflow-y-auto p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mx-auto mb-3 text-[#8696a0]">
            <Archive className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-sm text-white">No archived chats</h3>
          <p className="text-xs text-[#8696a0] mt-1 max-w-xs mx-auto leading-relaxed">
            Archive chats you don&apos;t need right now to keep your chat list clean. Archived chats
            remain archived when new messages arrive.
          </p>
        </div>
      )}

      {/* 5. STARRED MESSAGES VIEW */}
      {viewType === "starred" && (
        <div className="flex-1 overflow-y-auto p-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#202c33] flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Star className="w-8 h-8 fill-current" />
          </div>
          <h3 className="font-semibold text-sm text-white">No starred messages</h3>
          <p className="text-xs text-[#8696a0] mt-1 max-w-xs mx-auto leading-relaxed">
            Tap and hold any message to star it so you can easily find it later.
          </p>
        </div>
      )}
    </div>
  );
}
