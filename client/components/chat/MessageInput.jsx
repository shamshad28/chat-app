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
    <div className="relative border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl p-3 sm:p-4">
      {/* Active Reply Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between gap-3 mb-2.5 px-3.5 py-2 rounded-2xl bg-zinc-900/90 border border-violet-500/30 text-xs shadow-md animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2 overflow-hidden">
            <CornerUpLeft className="w-4 h-4 text-violet-400 flex-shrink-0" />
            <span className="font-semibold text-violet-400 flex-shrink-0">
              Replying to {replyingTo.sender?.name || "User"}:
            </span>
            <span className="text-zinc-300 truncate italic">
              {replyingTo.content || (replyingTo.type === "image" ? "📷 Photo" : "📎 Attachment")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
              className="relative flex-shrink-0 w-20 h-20 rounded-xl bg-white border border-[#e9edef] overflow-hidden group shadow-xs"
            >
              {preview.url ? (
                <img src={preview.url} alt={preview.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-[#54656f]">
                  {preview.type.startsWith("video/") ? (
                    <Video className="w-6 h-6 text-[#008069]" />
                  ) : (
                    <FileText className="w-6 h-6 text-[#008069]" />
                  )}
                  <span className="text-[9px] truncate w-full mt-1 font-medium">{preview.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-30 p-3 rounded-2xl bg-white border border-[#e9edef] shadow-2xl animate-in zoom-in-95 duration-150">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_PALETTE.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-[#f0f2f5] hover:scale-120 transition-all active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar Form (WhatsApp Style) */}
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
          className={`p-2.5 rounded-full transition-colors ${
            showEmojiPicker
              ? "text-[#008069] bg-[#e7fce3]"
              : "text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
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
          className="p-2.5 rounded-full text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] transition-colors disabled:opacity-50"
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
            className="w-full resize-none max-h-32 py-2 px-4 rounded-lg bg-white border border-[#e9edef] text-[#111b21] placeholder-[#8696a0] focus:outline-none focus:border-[#00a884] text-sm leading-relaxed shadow-xs"
          />
        </div>

        {/* Send Button (WhatsApp Green Circular Button) */}
        <button
          type="submit"
          disabled={uploading || sendingMessage || (!content.trim() && selectedFiles.length === 0)}
          className="p-2.5 rounded-full bg-[#008069] hover:bg-[#00a884] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95 transition-all flex items-center justify-center flex-shrink-0"
        >
          {uploading || sendingMessage ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}
