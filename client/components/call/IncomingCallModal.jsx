"use client";

import useCallStore from "../../store/callStore";
import { getAvatarColor, getInitials } from "../../lib/utils";
import { Phone, PhoneOff, Video } from "lucide-react";

export default function IncomingCallModal({ onAccept, onDecline }) {
  const callStatus = useCallStore((state) => state.callStatus);
  const callType = useCallStore((state) => state.callType);
  const activeCall = useCallStore((state) => state.activeCall);

  if (callStatus !== "incoming" || !activeCall) return null;

  const caller = activeCall.otherUser;
  const isVideo = callType === "video";
  const callerName = caller?.name || caller?.username || "Someone";
  const callerAvatar = caller?.avatar;
  const callerId = caller?._id || caller?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#111b21] border border-[#202c33] shadow-2xl overflow-hidden p-6 text-center text-zinc-100">
        {/* Glowing Ambient Background */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* WhatsApp Call Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
          {isVideo ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
          <span>WhatsApp {isVideo ? "Video" : "Voice"} Call</span>
        </div>

        {/* Caller Avatar with Pulsing Waves */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute w-28 h-28 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
          <div className="absolute w-24 h-24 rounded-full bg-emerald-500/30 animate-pulse" />

          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className="relative w-20 h-20 rounded-full object-cover ring-4 ring-emerald-500/60 shadow-xl"
            />
          ) : (
            <div
              className={`relative w-20 h-20 rounded-full bg-gradient-to-tr ${getAvatarColor(
                callerId
              )} flex items-center justify-center text-white font-bold text-2xl ring-4 ring-emerald-500/60 shadow-xl`}
            >
              {getInitials(callerName)}
            </div>
          )}
        </div>

        {/* Caller Info */}
        <h3 className="text-xl font-bold tracking-tight text-white">{callerName}</h3>
        {caller?.username && (
          <p className="text-xs text-zinc-400 mt-0.5">@{caller.username}</p>
        )}
        <p className="text-xs text-emerald-400 font-medium mt-2 animate-pulse">
          Incoming call...
        </p>

        {/* Action Buttons: Decline & Accept */}
        <div className="flex items-center justify-center gap-8 mt-8">
          {/* Decline Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onDecline}
              title="Decline"
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/40 active:scale-95 transition-all"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <span className="text-[11px] text-zinc-400 font-medium">Decline</span>
          </div>

          {/* Accept Button */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={onAccept}
              title="Accept"
              className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 active:scale-95 transition-all animate-bounce"
            >
              {isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
            </button>
            <span className="text-[11px] text-emerald-400 font-medium">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
