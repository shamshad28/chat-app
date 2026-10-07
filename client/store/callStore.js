import { create } from "zustand";

const useCallStore = create((set, get) => ({
  callStatus: "idle", // 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'
  callType: "video", // 'video' | 'audio'
  activeCall: null, // { otherUser, conversationId, isCaller, isGroup }
  
  localStream: null,
  remoteStream: null,
  
  isMuted: false,
  isVideoOff: false,
  isScreenSharing: false,
  remoteMediaState: { isMuted: false, isVideoOff: false },
  
  callDuration: 0,
  isMinimized: false,

  initiateCall: ({ otherUser, conversationId, callType = "video", isGroup = false }) =>
    set({
      callStatus: "calling",
      callType,
      activeCall: {
        otherUser,
        conversationId,
        isCaller: true,
        isGroup,
      },
      callDuration: 0,
      isMuted: false,
      isVideoOff: callType === "audio",
      isScreenSharing: false,
      remoteMediaState: { isMuted: false, isVideoOff: callType === "audio" },
      isMinimized: false,
    }),

  receiveCall: ({ caller, conversationId, isVideo = true, isGroup = false }) =>
    set({
      callStatus: "incoming",
      callType: isVideo ? "video" : "audio",
      activeCall: {
        otherUser: caller,
        conversationId,
        isCaller: false,
        isGroup,
      },
      callDuration: 0,
      isMuted: false,
      isVideoOff: !isVideo,
      isScreenSharing: false,
      remoteMediaState: { isMuted: false, isVideoOff: !isVideo },
      isMinimized: false,
    }),

  setConnected: (remoteStream = null) =>
    set({
      callStatus: "connected",
      ...(remoteStream ? { remoteStream } : {}),
    }),

  setLocalStream: (stream) => set({ localStream: stream }),
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  toggleMute: () =>
    set((state) => {
      const nextMuted = !state.isMuted;
      if (state.localStream) {
        state.localStream.getAudioTracks().forEach((track) => {
          track.enabled = !nextMuted;
        });
      }
      return { isMuted: nextMuted };
    }),

  toggleVideo: () =>
    set((state) => {
      const nextVideoOff = !state.isVideoOff;
      if (state.localStream) {
        state.localStream.getVideoTracks().forEach((track) => {
          track.enabled = !nextVideoOff;
        });
      }
      return { isVideoOff: nextVideoOff };
    }),

  setScreenSharing: (isScreenSharing) => set({ isScreenSharing }),

  setRemoteMediaState: (mediaState) =>
    set((state) => ({
      remoteMediaState: { ...state.remoteMediaState, ...mediaState },
    })),

  incrementDuration: () =>
    set((state) => ({
      callDuration: state.callDuration + 1,
    })),

  toggleMinimized: () =>
    set((state) => ({
      isMinimized: !state.isMinimized,
    })),

  endCall: () => {
    const { localStream, remoteStream } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    set({
      callStatus: "ended",
      localStream: null,
      remoteStream: null,
    });
  },

  resetCall: () => {
    const { localStream, remoteStream } = get();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    set({
      callStatus: "idle",
      callType: "video",
      activeCall: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      remoteMediaState: { isMuted: false, isVideoOff: false },
      callDuration: 0,
      isMinimized: false,
    });
  },
}));

export default useCallStore;
