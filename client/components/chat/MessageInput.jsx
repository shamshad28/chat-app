"use client";

import { useState, useRef, useEffect } from "react";
import { uploadFiles } from "../../services/uploadService";
import socket from "../../lib/socket";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import {
  Paperclip,
  Smile,
  Send,
  X,
  Image as ImageIcon,
  FileText,
  Video,
  CornerUpLeft,
  Loader2,
  Mic,
  Trash2,
} from "lucide-react";

const EMOJI_PALETTE = [
  "😀", "😂", "🥰", "😍", "😎", "🤔", "🙌", "👍",
  "❤️", "🔥", "✨", "🎉", "🚀", "💡", "💯", "🙏",
  "😭", "🤯", "🥳", "👀", "👏", "💪", "🌟", "👌"
];

export default function MessageInput({ conversationId, onSendMessage }) {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Voice recording timer
  useEffect(() => {
    let interval;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  const handleSendVoiceNote = () => {
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durationStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

    onSendMessage({
      conversationId,
      content: `🎤 Voice note (${durationStr})`,
      type: "audio",
      attachments: [],
      replyTo: replyingTo?._id || null,
    });

    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    setReplyingTo(null);
  };

  const handleDiscardVoiceNote = () => {
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const currentUser = useAuthStore((state) => state.user);
  const replyingTo = useChatStore((state) => state.replyingTo);
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const sendingMessage = useChatStore((state) => state.sendingMessage);

  // Handle files selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setFilePreviews((prev) => [...prev, ...newPreviews]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => {
      if (prev[index]?.url) URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Typing event emissions
  const handleTextChange = (e) => {
    setContent(e.target.value);

    if (!isTypingRef.current && currentUser && conversationId) {
      isTypingRef.current = true;
      socket.emit("typing:start", {
        conversationId,
        user: {
          _id: currentUser._id || currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
        },
      });
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      if (currentUser && conversationId) {
        socket.emit("typing:stop", {
          conversationId,
          userId: currentUser._id || currentUser.id,
        });
      }
    }, 2000);
  };

  const stopTypingImmediate = () => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (currentUser && conversationId) {
        socket.emit("typing:stop", {
          conversationId,
          userId: currentUser._id || currentUser.id,
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const text = content.trim();

    if (!text && selectedFiles.length === 0) return;
    if (uploading || sendingMessage) return;

    stopTypingImmediate();

    let uploadedAttachments = [];
    if (selectedFiles.length > 0) {
      try {
        setUploading(true);
        const uploadRes = await uploadFiles(selectedFiles);
        uploadedAttachments = uploadRes.attachments || [];
      } catch (err) {
        alert("Failed to upload files: " + (err.response?.data?.message || err.message));
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Determine type
    let msgType = "text";
    if (uploadedAttachments.length > 0) {
      msgType = uploadedAttachments[0].type || "document";
    }

    const payload = {
      conversationId,
      content: text,
      type: msgType,
      attachments: uploadedAttachments,
      replyTo: replyingTo?._id || null,
    };

    setContent("");
    setSelectedFiles([]);
    setFilePreviews([]);
    setReplyingTo(null);
    setShowEmojiPicker(false);

    onSendMessage(payload);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addEmoji = (emoji) => {
    setContent((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="relative border-t border-[#222e35] bg-[#202c33] p-2.5 sm:p-3 select-none">
      {/* Active Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between gap-3 mb-2 px-3 py-1.5 rounded-xl bg-[#182229] border-l-4 border-[#00a884] text-xs shadow-md animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 overflow-hidden">
            <CornerUpLeft className="w-3.5 h-3.5 text-[#00a884] flex-shrink-0" />
            <span className="font-semibold text-[#00a884] flex-shrink-0">
              Replying to {replyingTo.sender?.name || "User"}:
            </span>
            <span className="text-[#8696a0] truncate italic">
              {replyingTo.content || (replyingTo.type === "image" ? "📷 Photo" : "📎 Attachment")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#202c33] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Selected Attachments Preview Strip */}
      {filePreviews.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 mb-2 scrollbar-thin">
          {filePreviews.map((preview, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 w-20 h-20 rounded-xl bg-[#111b21] border border-[#2a3942] overflow-hidden group shadow-xs"
            >
              {preview.url ? (
                <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#8696a0]">
                  {preview.type.startsWith("video/") ? (
                    <Video className="w-6 h-6 text-[#00a884]" />
                  ) : (
                    <FileText className="w-6 h-6 text-[#00a884]" />
                  )}
                  <span className="text-[9px] truncate w-full mt-1 font-medium text-[#d1d7db]">{preview.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-30 p-3 rounded-2xl bg-[#202c33] border border-[#2a3942] shadow-2xl animate-in zoom-in-95 duration-150">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PALETTE.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[#2a3942] hover:scale-120 transition-all active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar Form (WhatsApp Style) */}
      {isRecordingVoice ? (
        <div className="flex items-center justify-between gap-3 max-w-5xl mx-auto px-2 py-1 bg-[#202c33] rounded-xl border border-[#2a3942] animate-in fade-in duration-100">
          <button
            type="button"
            onClick={handleDiscardVoiceNote}
            title="Discard voice recording"
            className="p-2 rounded-full text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 text-xs text-white">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-medium text-rose-400">Recording</span>
            <span className="font-mono text-sm font-semibold">
              {Math.floor(recordingSeconds / 60)}:
              {recordingSeconds % 60 < 10 ? "0" : ""}
              {recordingSeconds % 60}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSendVoiceNote}
            title="Send voice note"
            className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white shadow-sm active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
          />

          {/* Emoji Trigger Button */}
          <button
            type="button"
            title="Emojis"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full transition-colors ${
              showEmojiPicker
                ? "text-[#00a884] bg-[#103629]"
                : "text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
            }`}
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Attachment Button */}
          <button
            type="button"
            title="Attach"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sendingMessage}
            className="p-2 rounded-full text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942] transition-colors disabled:opacity-50"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Expanding Textarea */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              rows={1}
              disabled={uploading || sendingMessage}
              className="w-full resize-none max-h-32 py-2 px-4 rounded-lg bg-[#2a3942] border border-transparent text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884]/60 text-sm leading-relaxed"
            />
          </div>

          {/* Send or Voice Note Mic Button (WhatsApp Behavior) */}
          {content.trim() || selectedFiles.length > 0 ? (
            <button
              type="submit"
              disabled={uploading || sendingMessage}
              className="p-2.5 rounded-full bg-[#00a884] hover:bg-[#008069] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
            >
              {uploading || sendingMessage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRecordingVoice(true)}
              title="Voice note"
              className="p-2.5 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-[#00a884] hover:text-[#25d366] active:scale-95 transition-all flex items-center justify-center flex-shrink-0 border border-[#2a3942]"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
}
