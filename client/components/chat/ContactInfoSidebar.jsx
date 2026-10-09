"use client";

import { useState, useMemo } from "react";
import {
  X,
  Phone,
  Video,
  Search,
  Star,
  Bell,
  BellOff,
  Clock,
  Shield,
  ShieldCheck,
  UserX,
  ThumbsDown,
  Trash2,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Link2,
  Users,
  UserPlus,
  Share2,
  Check,
  QrCode,
  Edit2,
} from "lucide-react";
import { getInitials, formatLiveLastSeen } from "../../lib/utils";

export default function ContactInfoSidebar({
  isOpen,
  onClose,
  conversation,
  currentUser,
  isOtherUserOnline,
  messages = [],
  onStartVoiceCall,
  onStartVideoCall,
  onOpenSearch,
  onOpenGroupSettings,
}) {
  const [activeMediaTab, setActiveMediaTab] = useState("media"); // 'media' | 'docs' | 'links'
  const [isMuted, setIsMuted] = useState(conversation?.isMuted || false);
  const [disappearingTimer, setDisappearingTimer] = useState("Off");
  const [showQrModal, setShowQrModal] = useState(false);
  const [blocked, setBlocked] = useState(false);

  if (!isOpen || !conversation) return null;

  const isGroup = conversation.type === "group";
  const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
  const isGroupAdmin =
    isGroup &&
    (conversation.admins || []).some(
      (a) => (a._id || a.id || a)?.toString() === currentUserId
    );

  const otherUser = isGroup
    ? null
    : conversation.members?.find(
        (m) => (m._id || m.id)?.toString() !== currentUserId
      ) || conversation.members?.[0];

  const title = isGroup
    ? conversation.name
    : otherUser?.name || otherUser?.username || "Contact";

  const username = isGroup ? null : otherUser?.username || "user";
  const phone = isGroup ? null : otherUser?.phone || "+91 98765 43210";
  const about = isGroup
    ? conversation.description || "Group created for collaborative chat"
    : otherUser?.about || "Hey there! I am using WhatsApp.";

  const avatar = isGroup ? conversation.avatar : otherUser?.avatar;

  // Extract shared media, docs, and links from current messages
  const sharedMedia = useMemo(() => {
    return messages
      .filter((m) => m.type === "image" || (m.attachments && m.attachments.some((a) => a.mimeType?.startsWith("image"))))
      .map((m) => m.attachments?.[0]?.url || m.content)
      .filter((url) => url && typeof url === "string" && (url.startsWith("http") || url.startsWith("/uploads")));
  }, [messages]);

  const sharedDocs = useMemo(() => {
    return messages.filter(
      (m) => m.type === "document" || (m.attachments && m.attachments.some((a) => a.mimeType?.includes("pdf") || a.fileName))
    );
  }, [messages]);

  const sharedLinks = useMemo(() => {
    return messages.filter((m) => m.content && /https?:\/\/[^\s]+/.test(m.content));
  }, [messages]);

  const starredCount = useMemo(() => {
    return messages.filter((m) => m.isStarred).length;
  }, [messages]);

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleBlockToggle = () => {
    if (blocked) {
      setBlocked(false);
      alert(`Unblocked ${title}`);
    } else {
      if (confirm(`Block ${title}? Blocked contacts will no longer be able to call you or send you messages.`)) {
        setBlocked(true);
      }
    }
  };

  const handleReport = () => {
    if (confirm(`Report ${title} to WhatsApp? The last 5 messages will be forwarded to WhatsApp security.`)) {
      alert("Report submitted. Thank you for keeping WhatsApp secure.");
    }
  };

  return (
    <aside className="w-full sm:w-[340px] md:w-[380px] h-full bg-[#111b21] border-l border-[#222e35] flex flex-col overflow-hidden text-[#e9edef] z-20 flex-shrink-0 animate-in slide-in-from-right duration-200">
      {/* 1. Header with Close Button */}
      <div className="h-[60px] min-h-[60px] max-h-[60px] px-4 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-sm text-[#e9edef]">
          {isGroup ? "Group info" : "Contact info"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-[#2a3942] text-[#8696a0] hover:text-[#e9edef] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/70 space-y-2">
        {/* Profile Card */}
        <div className="p-6 flex flex-col items-center text-center bg-[#111b21]">
          <div className="relative mb-4">
            {avatar ? (
              <img
                src={avatar}
                alt={title}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-[#202c33] shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#534b3e] flex items-center justify-center text-white font-bold text-4xl shadow-lg ring-4 ring-[#202c33]">
                {isGroup ? <Users className="w-16 h-16 text-[#d1d7db]" /> : getInitials(title)}
              </div>
            )}

            {!isGroup && (
              <span
                className={`absolute bottom-1 right-2 w-5 h-5 rounded-full border-3 border-[#111b21] ${
                  isOtherUserOnline ? "bg-[#25d366]" : "bg-[#8696a0]"
                }`}
              />
            )}
          </div>

          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{title}</span>
            {isGroup && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-[#103629] text-[#25d366] border border-[#25d366]/20">
                Group
              </span>
            )}
          </h2>

          {!isGroup && (
            <p className="text-xs text-[#8696a0] mt-0.5 font-mono">
              {phone} • @{username}
            </p>
          )}

          <p className="text-xs text-[#00a884] font-medium mt-1">
            {isGroup
              ? `${conversation.members?.length || 0} participants`
              : isOtherUserOnline
              ? "● Online"
              : formatLiveLastSeen(otherUser?.lastSeen)}
          </p>

          {/* Quick Action Bar: Audio, Video, Search */}
          <div className="flex items-center justify-center gap-6 mt-5 w-full pt-2">
            <button
              type="button"
              onClick={onStartVoiceCall}
              className="flex flex-col items-center gap-1.5 text-xs text-[#00a884] hover:text-[#25d366] transition-colors group active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] flex items-center justify-center border border-[#2a3942] shadow-xs">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-[#d1d7db]">Audio</span>
            </button>

            <button
              type="button"
              onClick={onStartVideoCall}
              className="flex flex-col items-center gap-1.5 text-xs text-[#00a884] hover:text-[#25d366] transition-colors group active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] flex items-center justify-center border border-[#2a3942] shadow-xs">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-[#d1d7db]">Video</span>
            </button>

            <button
              type="button"
              onClick={onOpenSearch}
              className="flex flex-col items-center gap-1.5 text-xs text-[#8696a0] hover:text-[#e9edef] transition-colors group active:scale-95"
            >
              <div className="w-10 h-10 rounded-full bg-[#202c33] group-hover:bg-[#2a3942] flex items-center justify-center border border-[#2a3942] shadow-xs">
                <Search className="w-4 h-4 text-[#aebac1]" />
              </div>
              <span className="text-[11px] font-medium text-[#d1d7db]">Search</span>
            </button>
          </div>
        </div>

        {/* About & Phone Section */}
        <div className="p-4 bg-[#111b21] space-y-3">
          <div>
            <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1">
              {isGroup ? "Group Description" : "About"}
            </span>
            <p className="text-xs sm:text-sm text-[#e9edef] leading-relaxed bg-[#202c33]/50 p-2.5 rounded-lg border border-[#2a3942]/40">
              {about}
            </p>
          </div>

          {!isGroup && (
            <div>
              <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider block mb-1">
                Phone Number
              </span>
              <p className="text-xs sm:text-sm font-mono text-[#d1d7db]">{phone}</p>
            </div>
          )}
        </div>

        {/* Media, Links & Docs Drawer */}
        <div className="p-4 bg-[#111b21]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
              Media, links and docs
            </span>
            <div className="flex items-center gap-1 text-xs text-[#00a884]">
              <span>{sharedMedia.length + sharedDocs.length + sharedLinks.length}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Media Pills */}
          <div className="flex gap-2 mb-3">
            {[
              { id: "media", label: `Media (${sharedMedia.length})`, icon: ImageIcon },
              { id: "docs", label: `Docs (${sharedDocs.length})`, icon: FileText },
              { id: "links", label: `Links (${sharedLinks.length})`, icon: Link2 },
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveMediaTab(tab.id)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                    activeMediaTab === tab.id
                      ? "bg-[#202c33] text-[#00a884] border border-[#2a3942]"
                      : "bg-[#111b21] text-[#8696a0] hover:text-[#d1d7db]"
                  }`}
                >
                  <IconComp className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Media Content Tab */}
          {activeMediaTab === "media" && (
            <div>
              {sharedMedia.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8696a0] bg-[#202c33]/40 rounded-xl border border-[#2a3942]/40">
                  No photos or videos shared yet
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {sharedMedia.slice(0, 6).map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square rounded-lg overflow-hidden bg-[#202c33] border border-[#2a3942] hover:opacity-90 transition-opacity"
                    >
                      <img src={url} alt="media" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Docs Content Tab */}
          {activeMediaTab === "docs" && (
            <div className="space-y-1.5">
              {sharedDocs.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8696a0] bg-[#202c33]/40 rounded-xl border border-[#2a3942]/40">
                  No documents shared yet
                </div>
              ) : (
                sharedDocs.slice(0, 4).map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#202c33] border border-[#2a3942] text-xs"
                  >
                    <FileText className="w-4 h-4 text-[#00a884] flex-shrink-0" />
                    <span className="truncate text-[#e9edef] flex-1">
                      {doc.attachments?.[0]?.fileName || doc.content || "Document"}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Links Content Tab */}
          {activeMediaTab === "links" && (
            <div className="space-y-1.5">
              {sharedLinks.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#8696a0] bg-[#202c33]/40 rounded-xl border border-[#2a3942]/40">
                  No links shared in this conversation
                </div>
              ) : (
                sharedLinks.slice(0, 4).map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-[#202c33] border border-[#2a3942] text-xs"
                  >
                    <Link2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="truncate text-[#e9edef] flex-1 font-mono">
                      {link.content}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Starred Messages Section */}
        <div className="p-4 bg-[#111b21] hover:bg-[#202c33]/50 cursor-pointer transition-colors flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-4 h-4 text-[#8696a0]" />
            <span className="text-xs font-medium text-[#e9edef]">Starred messages</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#8696a0]">
            <span>{starredCount}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Notifications & Mute */}
        <div className="p-4 bg-[#111b21] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isMuted ? (
                <BellOff className="w-4 h-4 text-[#8696a0]" />
              ) : (
                <Bell className="w-4 h-4 text-[#8696a0]" />
              )}
              <div>
                <div className="text-xs font-medium text-[#e9edef]">Mute notifications</div>
                <div className="text-[11px] text-[#8696a0]">
                  {isMuted ? "Muted" : "Alerts will play normally"}
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isMuted}
              onChange={handleToggleMute}
              className="w-4 h-4 accent-[#00a884] rounded cursor-pointer"
            />
          </div>

          {/* Disappearing Messages */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#8696a0]" />
              <div>
                <div className="text-xs font-medium text-[#e9edef]">Disappearing messages</div>
                <div className="text-[11px] text-[#8696a0]">{disappearingTimer}</div>
              </div>
            </div>
            <select
              value={disappearingTimer}
              onChange={(e) => setDisappearingTimer(e.target.value)}
              className="bg-[#202c33] border border-[#2a3942] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="Off">Off</option>
              <option value="24 hours">24 hours</option>
              <option value="7 days">7 days</option>
              <option value="90 days">90 days</option>
            </select>
          </div>
        </div>

        {/* Encryption Verification */}
        <div
          onClick={() => setShowQrModal(true)}
          className="p-4 bg-[#111b21] hover:bg-[#202c33]/50 cursor-pointer transition-colors"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-[#00a884] flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-[#e9edef] flex items-center justify-between">
                <span>Encryption</span>
                <QrCode className="w-3.5 h-3.5 text-[#8696a0]" />
              </div>
              <p className="text-[11px] text-[#8696a0] mt-0.5 leading-relaxed">
                Messages and calls are end-to-end encrypted. Click to verify security code.
              </p>
            </div>
          </div>
        </div>

        {/* Group Participants Section if Group */}
        {isGroup && (
          <div className="p-4 bg-[#111b21] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
                {conversation.members?.length || 0} Participants
              </span>
              {onOpenGroupSettings && (
                <button
                  type="button"
                  onClick={onOpenGroupSettings}
                  className="text-xs text-[#00a884] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Manage</span>
                </button>
              )}
            </div>

            {/* Quick Add participant button for admins */}
            {isGroupAdmin && onOpenGroupSettings && (
              <button
                type="button"
                onClick={onOpenGroupSettings}
                className="w-full flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-[#202c33] text-[#00a884] font-medium text-xs transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-[#103629] group-hover:bg-[#154635] flex items-center justify-center text-[#25d366] flex-shrink-0 transition-colors">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Add participant</span>
              </button>
            )}

            <div className="max-h-52 overflow-y-auto divide-y divide-[#222e35] space-y-1">
              {(conversation.members || []).map((member) => {
                const mId = (member._id || member.id || member)?.toString();
                const isMe = mId === currentUserId;
                const isMAdmin = (conversation.admins || []).some(
                  (a) => (a._id || a.id || a)?.toString() === mId
                );

                return (
                  <div
                    key={mId}
                    className="flex items-center justify-between py-2 text-xs text-[#e9edef]"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-full bg-[#534b3e] flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                        {member.avatar ? (
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(member.name || "Member")
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">
                          {isMe ? "You" : member.name || member.username}
                        </div>
                        <div className="text-[10px] text-[#8696a0] truncate">
                          {member.about || "Hey there!"}
                        </div>
                      </div>
                    </div>

                    {isMAdmin && (
                      <span className="text-[10px] font-semibold text-[#00a884] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-[#00a884]/30">
                        Group Admin
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions: Block / Report */}
        <div className="p-4 bg-[#111b21] space-y-2">
          {!isGroup && (
            <button
              type="button"
              onClick={handleBlockToggle}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors ${
                blocked
                  ? "text-[#00a884] hover:bg-[#202c33]"
                  : "text-rose-400 hover:bg-rose-500/10"
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>{blocked ? `Unblock ${title}` : `Block ${title}`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReport}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>{isGroup ? "Report group" : `Report ${title}`}</span>
          </button>
        </div>
      </div>

      {/* Security Code QR Verification Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[#111b21] border border-[#222e35] p-6 text-center shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-base text-white mb-2">Verify Security Code</h3>
            <p className="text-xs text-[#8696a0] mb-4">
              To verify that end-to-end encryption is enabled with {title}, scan this QR code on your phone:
            </p>

            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl shadow-inner flex items-center justify-center mb-4">
              <div className="w-full h-full border-4 border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-900 font-mono text-[10px]">
                <QrCode className="w-24 h-24 text-gray-900 mb-2" />
                <span>60-DIGIT SECURITY NUM</span>
              </div>
            </div>

            <p className="font-mono text-[11px] text-[#25d366] tracking-widest mb-6">
              12849 59302 91823 48192 48194
            </p>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white text-xs font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
