"use client";

import { useEffect, useRef } from "react";
import useCallStore from "../../store/callStore";
import { getAvatarColor, getInitials } from "../../lib/utils";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Maximize2,
  Minimize2,
  Shield,
  Lock,
} from "lucide-react";

export default function VideoCallModal({
  onEndCall,
  onToggleScreenShare,
  isScreenSharing,
}) {
  const callStatus = useCallStore((state) => state.callStatus);
  const callType = useCallStore((state) => state.callType);
  const activeCall = useCallStore((state) => state.activeCall);
  const localStream = useCallStore((state) => state.localStream);
  const remoteStream = useCallStore((state) => state.remoteStream);
  const isMuted = useCallStore((state) => state.isMuted);
  const isVideoOff = useCallStore((state) => state.isVideoOff);
  const remoteMediaState = useCallStore((state) => state.remoteMediaState);
  const callDuration = useCallStore((state) => state.callDuration);
  const isMinimized = useCallStore((state) => state.isMinimized);

  const toggleMute = useCallStore((state) => state.toggleMute);
  const toggleVideo = useCallStore((state) => state.toggleVideo);
  const toggleMinimized = useCallStore((state) => state.toggleMinimized);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Bind local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff, isMinimized]);

  // Bind remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isMinimized]);

  // Only render if a call is ongoing
  if (
    callStatus !== "calling" &&
    callStatus !== "connected" &&
    callStatus !== "ended"
  ) {
    return null;
  }

  const otherUser = activeCall?.otherUser;
  const otherUserName = otherUser?.name || otherUser?.username || "Contact";
  const otherUserAvatar = otherUser?.avatar;
  const otherUserId = otherUser?._id || otherUser?.id;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remSecs
      .toString()
      .padStart(2, "0")}`;
  };

  // 1. Minimized View (PiP floating in bottom-right corner)
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-72 rounded-3xl bg-[#111b21] border border-[#202c33] shadow-2xl overflow-hidden p-3 text-zinc-100 backdrop-blur-xl animate-in zoom-in-95">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold truncate text-white">{otherUserName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-zinc-400">
              {callStatus === "connected" ? formatTime(callDuration) : "Calling..."}
            </span>
            <button
              type="button"
              onClick={toggleMinimized}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              title="Maximize"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Small Video Preview */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
          {remoteStream && !remoteMediaState.isVideoOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center text-xs text-zinc-400 font-medium">
              {otherUserName}
            </div>
          )}
        </div>

        {/* Quick controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <button
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-full text-xs transition-colors ${
              isMuted ? "bg-rose-600 text-white" : "bg-[#202c33] text-zinc-300 hover:bg-[#2a3942]"
            }`}
          >
            {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onEndCall}
            className="p-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-colors"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Fullscreen / Expanded WhatsApp Call Window
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-full max-h-[85vh] rounded-3xl bg-[#0b141a] border border-[#202c33] shadow-2xl overflow-hidden flex flex-col text-zinc-100">
        
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111b21]/80 border border-[#202c33] text-zinc-300 text-xs">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>End-to-end encrypted</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#111b21]/80 border border-[#202c33] text-xs font-mono text-emerald-400">
              {callStatus === "connected"
                ? formatTime(callDuration)
                : callStatus === "ended"
                ? "Call Ended"
                : "Calling..."}
            </span>

            <button
              type="button"
              onClick={toggleMinimized}
              title="Minimize call"
              className="p-2 rounded-xl bg-[#111b21]/80 border border-[#202c33] text-zinc-400 hover:text-white hover:bg-[#202c33] transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Display: Remote Video / Calling State */}
        <div className="relative flex-1 w-full h-full bg-[#111b21] flex items-center justify-center overflow-hidden">
          {callStatus === "connected" && remoteStream && !remoteMediaState.isVideoOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            // Calling Screen or Remote Video Off View
            <div className="flex flex-col items-center justify-center text-center p-6 select-none">
              <div className="relative flex items-center justify-center mb-6">
                {callStatus === "calling" && (
                  <>
                    <div className="absolute w-36 h-36 rounded-full bg-emerald-500/15 animate-ping duration-1000" />
                    <div className="absolute w-32 h-32 rounded-full bg-emerald-500/20 animate-pulse" />
                  </>
                )}

                {otherUserAvatar ? (
                  <img
                    src={otherUserAvatar}
                    alt={otherUserName}
                    className="relative w-28 h-28 rounded-full object-cover ring-4 ring-[#202c33] shadow-2xl"
                  />
                ) : (
                  <div
                    className={`relative w-28 h-28 rounded-full bg-gradient-to-tr ${getAvatarColor(
                      otherUserId
                    )} flex items-center justify-center text-white font-bold text-3xl ring-4 ring-[#202c33] shadow-2xl`}
                  >
                    {getInitials(otherUserName)}
                  </div>
                )}
              </div>

              <h2 className="text-2xl font-bold text-white tracking-tight">{otherUserName}</h2>
              <p className="text-xs text-zinc-400 mt-1">
                {callStatus === "calling"
                  ? "Ringing..."
                  : callStatus === "ended"
                  ? "Call ended"
                  : remoteMediaState.isVideoOff
                  ? "Camera is turned off"
                  : "Connecting..."}
              </p>
            </div>
          )}

          {/* Picture-in-Picture Local Self Video */}
          <div className="absolute top-20 right-6 z-20 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden bg-black/70 border border-[#202c33] shadow-2xl backdrop-blur-md">
            {!isVideoOff && localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#111b21] text-zinc-500 text-xs">
                <VideoOff className="w-5 h-5 mb-1 text-zinc-600" />
                <span>Camera Off</span>
              </div>
            )}
          </div>
        </div>

        {/* Floating WhatsApp Control Bar (Bottom) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-3 sm:gap-4 px-6 py-3.5 rounded-full bg-[#111b21]/95 border border-[#202c33] shadow-2xl backdrop-blur-2xl">
            {/* 1. Mute Audio */}
            <button
              type="button"
              onClick={toggleMute}
              title={isMuted ? "Unmute microphone" : "Mute microphone"}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isMuted
                  ? "bg-rose-600 text-white"
                  : "bg-[#202c33] text-zinc-200 hover:bg-[#2a3942]"
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* 2. Toggle Camera */}
            <button
              type="button"
              onClick={toggleVideo}
              title={isVideoOff ? "Turn camera on" : "Turn camera off"}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isVideoOff
                  ? "bg-rose-600 text-white"
                  : "bg-[#202c33] text-zinc-200 hover:bg-[#2a3942]"
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            {/* 3. Screen Sharing */}
            <button
              type="button"
              onClick={onToggleScreenShare}
              title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              className={`p-3 rounded-full transition-all active:scale-95 ${
                isScreenSharing
                  ? "bg-violet-600 text-white"
                  : "bg-[#202c33] text-zinc-200 hover:bg-[#2a3942]"
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>

            {/* 4. End Call Button (Prominent Red) */}
            <button
              type="button"
              onClick={onEndCall}
              title="End call"
              className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 transition-all active:scale-90 ml-1"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
