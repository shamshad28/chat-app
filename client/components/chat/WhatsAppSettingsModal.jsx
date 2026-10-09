"use client";

import { useState } from "react";
import {
  X,
  User,
  Settings as SettingsIcon,
  Shield,
  MessageSquare,
  Bell,
  Lock,
  Keyboard,
  HelpCircle,
  LogOut,
  Camera,
  Check,
  Edit2,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
} from "lucide-react";
import useAuthStore from "../../store/authStore";
import { getAvatarColor, getInitials } from "../../lib/utils";

export default function WhatsAppSettingsModal({ isOpen, onClose, onLogout }) {
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [activeTab, setActiveTab] = useState("general"); // 'general' | 'account' | 'chats' | 'notifications' | 'privacy' | 'shortcuts' | 'help'

  // Editable Profile States
  const [name, setName] = useState(currentUser?.name || "Khan shamshad");
  const [about, setAbout] = useState(currentUser?.about || "Hey there! I am using WhatsApp.");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);

  // Live Settings States (Persisted in localStorage)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("wa_theme") || "dark";
    return "dark";
  });

  const [wallpaper, setWallpaper] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("wa_wallpaper") || "doodle-dark";
    return "doodle-dark";
  });

  const [enterIsSend, setEnterIsSend] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [securityNotifications, setSecurityNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [reactionNotifications, setReactionNotifications] = useState(true);
  const [lastSeenPrivacy, setLastSeenPrivacy] = useState("Everyone");
  const [disappearingTimer, setDisappearingTimer] = useState("Off");

  if (!isOpen) return null;

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("wa_theme", newTheme);
      if (newTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    }
  };

  const handleWallpaperChange = (wp) => {
    setWallpaper(wp);
    if (typeof window !== "undefined") {
      localStorage.setItem("wa_wallpaper", wp);
    }
  };

  const handleSaveProfile = () => {
    if (currentUser) {
      setUser({
        ...currentUser,
        name: name.trim() || currentUser.name,
        about: about.trim() || "Hey there! I am using WhatsApp.",
      });
    }
    setIsEditingName(false);
    setIsEditingAbout(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[680px] rounded-2xl bg-[#111b21] border border-[#222e35] shadow-2xl flex overflow-hidden text-[#e9edef] animate-in zoom-in-95 duration-150">
        
        {/* Left Sidebar Menu inside Settings */}
        <div className="w-64 min-w-[240px] h-full bg-[#111b21] border-r border-[#222e35] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="p-4 border-b border-[#222e35] flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#e9edef]">Settings</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#202c33] text-[#8696a0] hover:text-[#e9edef] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Row in Navigation */}
            <div
              onClick={() => setActiveTab("profile")}
              className={`p-3 mx-2 my-2 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                activeTab === "profile"
                  ? "bg-[#202c33] text-white"
                  : "hover:bg-[#202c33]/70 text-[#d1d7db]"
              }`}
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-[#534b3e] flex items-center justify-center font-bold text-base text-white">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  getInitials(name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate text-[#e9edef]">{name}</div>
                <div className="text-xs text-[#8696a0] truncate mt-0.5">{about}</div>
              </div>
            </div>

            {/* Navigation Tabs List */}
            <nav className="px-2 space-y-0.5">
              {[
                { id: "general", label: "General", icon: SettingsIcon },
                { id: "account", label: "Account", icon: Shield },
                { id: "chats", label: "Chats", icon: MessageSquare },
                { id: "notifications", label: "Notifications", icon: Bell },
                { id: "privacy", label: "Privacy", icon: Lock },
                { id: "shortcuts", label: "Keyboard shortcuts", icon: Keyboard },
                { id: "help", label: "Help", icon: HelpCircle },
              ].map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#202c33] text-[#00a884]"
                        : "text-[#aebac1] hover:bg-[#202c33]/70 hover:text-[#e9edef]"
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? "text-[#00a884]" : "text-[#8696a0]"}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Log out button at bottom */}
          <div className="p-3 border-t border-[#222e35]">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Right Content Area for Selected Setting */}
        <div className="flex-1 h-full overflow-y-auto bg-[#111b21] p-6 text-[#d1d7db]">
          {/* 1. Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-md mx-auto space-y-6">
              <h3 className="text-lg font-semibold text-white">Profile</h3>

              {/* Avatar section */}
              <div className="flex flex-col items-center">
                <div className="group relative w-32 h-32 rounded-full overflow-hidden bg-[#534b3e] flex items-center justify-center text-4xl font-bold text-white shadow-lg ring-4 ring-[#202c33]">
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(name)
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] uppercase font-semibold">Change Photo</span>
                  </div>
                </div>
              </div>

              {/* Name Editor */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-2">
                <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
                  Your Name
                </label>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-[#111b21] border border-[#00a884] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="p-2 rounded-lg bg-[#00a884] hover:bg-[#008069] text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{name}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      className="p-1.5 rounded-lg text-[#8696a0] hover:text-[#00a884] hover:bg-[#111b21]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-[#8696a0]">
                  This is not your username or pin. This name will be visible to your WhatsApp contacts.
                </p>
              </div>

              {/* About Editor */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-2">
                <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
                  About
                </label>
                {isEditingAbout ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      className="flex-1 bg-[#111b21] border border-[#00a884] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="p-2 rounded-lg bg-[#00a884] hover:bg-[#008069] text-white"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{about}</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingAbout(true)}
                      className="p-1.5 rounded-lg text-[#8696a0] hover:text-[#00a884] hover:bg-[#111b21]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Phone / Username */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-1">
                <label className="text-xs font-semibold text-[#8696a0] uppercase tracking-wider">
                  Username & Phone
                </label>
                <div className="text-sm font-mono text-white">@{currentUser?.username || "shamshad"}</div>
                <div className="text-xs text-[#8696a0]">+91 98765 43210</div>
              </div>
            </div>
          )}

          {/* 2. General Tab */}
          {activeTab === "general" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">General</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
                  <h4 className="text-sm font-semibold text-white">Startup</h4>
                  <label className="flex items-center justify-between text-xs text-[#d1d7db] cursor-pointer">
                    <span>Start WhatsApp at login</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-[#00a884] rounded"
                    />
                  </label>
                </div>

                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
                  <h4 className="text-sm font-semibold text-white">Language</h4>
                  <select
                    defaultValue="English"
                    className="w-full bg-[#111b21] border border-[#2a3942] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#00a884]"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">हिन्दी (Hindi)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                    <option value="Arabic">العربية (Arabic)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
                  <h4 className="text-sm font-semibold text-white">Typing & Sounds</h4>
                  <label className="flex items-center justify-between text-xs text-[#d1d7db] cursor-pointer">
                    <span>In-chat outgoing message audio cues</span>
                    <input
                      type="checkbox"
                      checked={soundEnabled}
                      onChange={(e) => setSoundEnabled(e.target.checked)}
                      className="w-4 h-4 accent-[#00a884] rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 3. Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Account</h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Security notifications</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Show security notifications when encryption keys change
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={securityNotifications}
                    onChange={(e) => setSecurityNotifications(e.target.checked)}
                    className="w-4 h-4 accent-[#00a884] rounded"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Two-step verification</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Enabled with security PIN
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#00a884] bg-emerald-950/60 px-2 py-0.5 rounded border border-[#00a884]/30">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between cursor-pointer hover:bg-[#2a3942] transition-colors">
                  <div>
                    <div className="text-sm font-medium text-white">Request account information</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Download a report of your account info and settings
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8696a0]" />
                </div>
              </div>
            </div>
          )}

          {/* 4. Chats Tab (Theme, Wallpaper, Enter is Send) */}
          {activeTab === "chats" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Chats</h3>

              {/* Theme Selector */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
                <h4 className="text-sm font-semibold text-white">Theme</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "dark", label: "Dark (Default)", icon: Moon },
                    { id: "light", label: "Light", icon: Sun },
                    { id: "system", label: "System Default", icon: Monitor },
                    { id: "amoled", label: "AMOLED Black", icon: Moon },
                  ].map((t) => {
                    const IconC = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleThemeChange(t.id)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                          theme === t.id
                            ? "bg-[#111b21] border-[#00a884] text-[#00a884]"
                            : "bg-[#111b21]/50 border-[#2a3942] text-[#8696a0] hover:text-white"
                        }`}
                      >
                        <IconC className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Wallpaper Chooser */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3">
                <h4 className="text-sm font-semibold text-white">Chat Wallpaper</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "doodle-dark", label: "Doodle Dark", bg: "bg-[#0b141a]" },
                    { id: "teal", label: "Forest Teal", bg: "bg-[#054740]" },
                    { id: "navy", label: "Midnight Navy", bg: "bg-[#0f172a]" },
                    { id: "charcoal", label: "Charcoal", bg: "bg-[#18181b]" },
                  ].map((wp) => (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => handleWallpaperChange(wp.id)}
                      className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center p-1 text-[10px] font-medium transition-all ${wp.bg} ${
                        wallpaper === wp.id ? "border-[#00a884] shadow-md scale-102" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      {wallpaper === wp.id && <Check className="w-4 h-4 text-[#00a884]" />}
                      <span className="text-white mt-1">{wp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter is Send Toggle */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white">Enter is Send</div>
                  <div className="text-xs text-[#8696a0] mt-0.5">
                    Pressing Enter will send your message
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enterIsSend}
                  onChange={(e) => setEnterIsSend(e.target.checked)}
                  className="w-4 h-4 accent-[#00a884] rounded"
                />
              </div>

              {/* Media Auto-Download */}
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-2">
                <h4 className="text-sm font-semibold text-white">Media auto-download</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#d1d7db]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#00a884]" />
                    <span>Photos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#00a884]" />
                    <span>Audio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-[#00a884]" />
                    <span>Videos</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#00a884]" />
                    <span>Documents</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 5. Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Message notifications</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Show notifications for new messages
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 accent-[#00a884] rounded"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Show message previews</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Display sender name and message snippet in alerts
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={previewEnabled}
                    onChange={(e) => setPreviewEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#00a884] rounded"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Reaction notifications</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Show notifications when someone reacts to your messages
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reactionNotifications}
                    onChange={(e) => setReactionNotifications(e.target.checked)}
                    className="w-4 h-4 accent-[#00a884] rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. Privacy Tab (Read receipts toggle!) */}
          {activeTab === "privacy" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Privacy</h3>

              <div className="space-y-3">
                {/* Read receipts */}
                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Read receipts (Blue ticks)</div>
                    <div className="text-xs text-[#8696a0] mt-0.5 max-w-xs">
                      If turned off, you won't send or receive read receipts. Read receipts are always sent for group chats.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={readReceipts}
                    onChange={(e) => setReadReceipts(e.target.checked)}
                    className="w-4 h-4 accent-[#00a884] rounded"
                  />
                </div>

                {/* Last seen & online */}
                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Last seen & online</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">Control who can see your activity</div>
                  </div>
                  <select
                    value={lastSeenPrivacy}
                    onChange={(e) => setLastSeenPrivacy(e.target.value)}
                    className="bg-[#111b21] border border-[#2a3942] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="Everyone">Everyone</option>
                    <option value="My contacts">My contacts</option>
                    <option value="Nobody">Nobody</option>
                  </select>
                </div>

                {/* Disappearing messages */}
                <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Default message timer</div>
                    <div className="text-xs text-[#8696a0] mt-0.5">
                      Start new chats with disappearing messages
                    </div>
                  </div>
                  <select
                    value={disappearingTimer}
                    onChange={(e) => setDisappearingTimer(e.target.value)}
                    className="bg-[#111b21] border border-[#2a3942] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                  >
                    <option value="Off">Off</option>
                    <option value="24 hours">24 hours</option>
                    <option value="7 days">7 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 7. Keyboard Shortcuts */}
          {activeTab === "shortcuts" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Keyboard shortcuts</h3>
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] divide-y divide-[#2a3942]">
                {[
                  { action: "New chat", keys: ["Ctrl", "Alt", "N"] },
                  { action: "Search chats", keys: ["Ctrl", "Alt", "/"] },
                  { action: "Next chat", keys: ["Ctrl", "Alt", "Tab"] },
                  { action: "Previous chat", keys: ["Ctrl", "Alt", "Shift", "Tab"] },
                  { action: "Close chat", keys: ["Escape"] },
                  { action: "Mute conversation", keys: ["Ctrl", "Alt", "Shift", "M"] },
                  { action: "Archive conversation", keys: ["Ctrl", "Alt", "Shift", "E"] },
                  { action: "Open Settings", keys: ["Ctrl", "Alt", ","] },
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-xs">
                    <span className="text-[#d1d7db]">{s.action}</span>
                    <div className="flex items-center gap-1 font-mono">
                      {s.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded bg-[#111b21] border border-[#2a3942] text-[10px] text-[#aebac1]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Help Tab */}
          {activeTab === "help" && (
            <div className="space-y-6 max-w-lg">
              <h3 className="text-lg font-semibold text-white">Help</h3>
              <div className="p-4 rounded-xl bg-[#202c33] border border-[#2a3942] space-y-3 text-xs">
                <div className="text-sm font-semibold text-[#00a884]">
                  WhatsApp Desktop
                </div>
                <div className="text-[#8696a0]">Version 2.24.18.7 Desktop Edition</div>
                <div className="border-t border-[#2a3942] pt-3 space-y-2">
                  <a href="#" className="block text-[#00a884] hover:underline">
                    Help Center & FAQs
                  </a>
                  <a href="#" className="block text-[#00a884] hover:underline">
                    Terms & Privacy Policy
                  </a>
                  <a href="#" className="block text-[#00a884] hover:underline">
                    Licenses & Third-Party Notices
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
