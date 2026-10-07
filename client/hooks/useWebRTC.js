"use client";

import { useEffect, useRef, useCallback } from "react";
import socket from "../lib/socket";
import useCallStore from "../store/callStore";
import useAuthStore from "../store/authStore";
import {
  startIncomingRingtone,
  startOutgoingRingtone,
  playCallEndSound,
  stopCallAudio,
} from "../lib/sound";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export default function useWebRTC() {
  const currentUser = useAuthStore((state) => state.user);

  const callStatus = useCallStore((state) => state.callStatus);
  const callType = useCallStore((state) => state.callType);
  const activeCall = useCallStore((state) => state.activeCall);
  const isMuted = useCallStore((state) => state.isMuted);
  const isVideoOff = useCallStore((state) => state.isVideoOff);
  const isScreenSharing = useCallStore((state) => state.isScreenSharing);

  const initiateCallAction = useCallStore((state) => state.initiateCall);
  const receiveCallAction = useCallStore((state) => state.receiveCall);
  const setConnectedAction = useCallStore((state) => state.setConnected);
  const setLocalStreamAction = useCallStore((state) => state.setLocalStream);
  const setRemoteStreamAction = useCallStore((state) => state.setRemoteStream);
  const setScreenSharingAction = useCallStore((state) => state.setScreenSharing);
  const setRemoteMediaStateAction = useCallStore((state) => state.setRemoteMediaState);
  const incrementDurationAction = useCallStore((state) => state.incrementDuration);
  const endCallAction = useCallStore((state) => state.endCall);
  const resetCallAction = useCallStore((state) => state.resetCall);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const screenTrackRef = useRef(null);
  const originalVideoTrackRef = useRef(null);

  // Helper to acquire local media stream with resilient fallbacks
  const getMediaStream = useCallback(async (withVideo = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
      });
      return stream;
    } catch (err) {
      console.warn("Primary media access failed:", err.message);
      // Fallback 1: Audio only if video failed
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return audioStream;
      } catch (audioErr) {
        console.warn("Audio-only media access failed:", audioErr.message);
        // Fallback 2: Silent canvas mock stream for testing environments without webcam/mic
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#111b21";
        ctx.fillRect(0, 0, 640, 480);
        const mockStream = canvas.captureStream(15);
        return mockStream;
      }
    }
  }, []);

  // Initialize RTCPeerConnection
  const createPeerConnection = useCallback((targetUserId) => {
    if (pcRef.current) {
      pcRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Send local ICE candidates to remote peer via socket
    pc.onicecandidate = (event) => {
      if (event.candidate && targetUserId) {
        socket.emit("call:signal", {
          targetUserId,
          signal: event.candidate,
          type: "candidate",
        });
      }
    };

    // When remote track arrives, update call store's remoteStream
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (stream) {
        setRemoteStreamAction(stream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setConnectedAction();
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        // Disconnected handling
      }
    };

    return pc;
  }, [setConnectedAction, setRemoteStreamAction]);

  // Start Call (Outgoing)
  const startCall = useCallback(
    async ({ recipient, conversationId, isVideo = true, isGroup = false }) => {
      const otherUserId = recipient?._id || recipient?.id;
      if (!otherUserId || !currentUser) return;

      initiateCallAction({
        otherUser: recipient,
        conversationId,
        callType: isVideo ? "video" : "audio",
        isGroup,
      });

      startOutgoingRingtone();

      const stream = await getMediaStream(isVideo);
      localStreamRef.current = stream;
      setLocalStreamAction(stream);

      // Create peer connection
      const pc = createPeerConnection(otherUserId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Emit call:initiate to server
      socket.emit("call:initiate", {
        recipientId: otherUserId,
        conversationId,
        isVideo,
        caller: currentUser,
        isGroup,
      });
    },
    [
      currentUser,
      initiateCallAction,
      getMediaStream,
      setLocalStreamAction,
      createPeerConnection,
    ]
  );

  // Accept Call (Incoming)
  const acceptCall = useCallback(async () => {
    if (!activeCall?.otherUser) return;
    const callerId = activeCall.otherUser._id || activeCall.otherUser.id;

    stopCallAudio();

    const isVideo = callType === "video";
    const stream = await getMediaStream(isVideo);
    localStreamRef.current = stream;
    setLocalStreamAction(stream);

    const pc = createPeerConnection(callerId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Notify caller that call was accepted
    socket.emit("call:accept", {
      callerId,
      recipient: currentUser,
      conversationId: activeCall.conversationId,
      isVideo,
    });

    setConnectedAction();
  }, [
    activeCall,
    callType,
    getMediaStream,
    setLocalStreamAction,
    createPeerConnection,
    currentUser,
    setConnectedAction,
  ]);

  // Decline Call
  const declineCall = useCallback(() => {
    stopCallAudio();
    playCallEndSound();

    if (activeCall?.otherUser) {
      const callerId = activeCall.otherUser._id || activeCall.otherUser.id;
      socket.emit("call:decline", { callerId, reason: "Decline" });
    }

    endCallAction();
    setTimeout(() => resetCallAction(), 800);
  }, [activeCall, endCallAction, resetCallAction]);

  // End Call
  const endCall = useCallback(() => {
    stopCallAudio();
    playCallEndSound();

    if (activeCall?.otherUser) {
      const targetUserId = activeCall.otherUser._id || activeCall.otherUser.id;
      socket.emit("call:end", {
        targetUserId,
        conversationId: activeCall.conversationId,
      });
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    endCallAction();
    setTimeout(() => resetCallAction(), 800);
  }, [activeCall, endCallAction, resetCallAction]);

  // Toggle Screen Sharing
  const toggleScreenShare = useCallback(async () => {
    if (!pcRef.current || !localStreamRef.current) return;

    if (isScreenSharing) {
      // Revert back to camera
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      if (originalVideoTrackRef.current) {
        const videoSender = pcRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(originalVideoTrackRef.current);
        }
      }
      setScreenSharingAction(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        const videoSender = pcRef.current
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (videoSender) {
          originalVideoTrackRef.current = videoSender.track;
          videoSender.replaceTrack(screenTrack);
        }

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setScreenSharingAction(true);
      } catch (err) {
        console.warn("Screen share cancelled:", err.message);
      }
    }
  }, [isScreenSharing, setScreenSharingAction]);

  // Broadcast media toggle (mute/video off)
  useEffect(() => {
    if (callStatus === "connected" && activeCall?.otherUser) {
      const targetUserId = activeCall.otherUser._id || activeCall.otherUser.id;
      socket.emit("call:toggle-media", {
        targetUserId,
        isMuted,
        isVideoOff,
      });
    }
  }, [isMuted, isVideoOff, callStatus, activeCall]);

  // Live duration timer during connected call
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => {
        incrementDurationAction();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [callStatus, incrementDurationAction]);

  // Listen to Socket Signaling Events
  useEffect(() => {
    if (!socket) return;

    // 1. Incoming Call
    const handleIncomingCall = ({ caller, conversationId, isVideo, isGroup }) => {
      if (callStatus !== "idle") {
        // Line busy
        socket.emit("call:decline", {
          callerId: caller?._id || caller?.id,
          reason: "Busy",
        });
        return;
      }

      startIncomingRingtone();
      receiveCallAction({ caller, conversationId, isVideo, isGroup });
    };

    // 2. Call Accepted by Remote Peer
    const handleCallAccepted = async ({ recipient }) => {
      stopCallAudio();

      if (pcRef.current) {
        try {
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);

          const targetUserId = recipient?._id || recipient?.id || activeCall?.otherUser?._id;
          socket.emit("call:signal", {
            targetUserId,
            signal: offer,
            type: "offer",
          });
        } catch (err) {
          console.error("Error creating offer:", err);
        }
      }

      setConnectedAction();
    };

    // 3. WebRTC Signal (Offer / Answer / ICE Candidate)
    const handleCallSignal = async ({ senderId, signal, type }) => {
      if (!pcRef.current) return;

      try {
        if (type === "offer") {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);

          socket.emit("call:signal", {
            targetUserId: senderId,
            signal: answer,
            type: "answer",
          });

          setConnectedAction();
        } else if (type === "answer") {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          setConnectedAction();
        } else if (type === "candidate") {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(signal));
        }
      } catch (err) {
        console.error("Error handling WebRTC signal:", err);
      }
    };

    // 4. Call Declined
    const handleCallDeclined = () => {
      stopCallAudio();
      playCallEndSound();
      endCallAction();
      setTimeout(() => resetCallAction(), 1200);
    };

    // 5. Call Ended by Peer
    const handleCallEnded = () => {
      stopCallAudio();
      playCallEndSound();
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      endCallAction();
      setTimeout(() => resetCallAction(), 800);
    };

    // 6. Remote Media State Changed
    const handleMediaToggled = ({ isMuted: remoteMuted, isVideoOff: remoteVideoOff }) => {
      setRemoteMediaStateAction({
        isMuted: remoteMuted,
        isVideoOff: remoteVideoOff,
      });
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:signal", handleCallSignal);
    socket.on("call:declined", handleCallDeclined);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:media-toggled", handleMediaToggled);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:signal", handleCallSignal);
      socket.off("call:declined", handleCallDeclined);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:media-toggled", handleMediaToggled);
    };
  }, [
    callStatus,
    activeCall,
    receiveCallAction,
    setConnectedAction,
    endCallAction,
    resetCallAction,
    setRemoteMediaStateAction,
  ]);

  return {
    callStatus,
    callType,
    activeCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleScreenShare,
    isScreenSharing,
  };
}
