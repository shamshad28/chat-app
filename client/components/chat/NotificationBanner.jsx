"use client";

import useNotificationStore from "../../store/notificationStore";
import { getAvatarColor, getInitials } from "../../lib/utils";
import { X } from "lucide-react";

export default function NotificationBanner({ onSelectConversation }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {notifications.map((notif) => {
        const avatar = notif.avatar;
        const title = notif.title || "New Message";
        const body = notif.body || "";
        const convId = notif.conversationId;

        return (
          <div
            key={notif.id}
            onClick={() => {
              if (convId && onSelectConversation) {
                onSelectConversation(convId);
                removeNotification(notif.id);
              }
            }}
            className="pointer-events-auto cursor-pointer group relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#e9edef] shadow-xl text-[#111b21] transition-all hover:bg-[#f0f2f5] hover:border-[#25d366]/50 active:scale-[0.98] animate-in slide-in-from-top-4 duration-200"
          >
            {/* Left green accent bar */}
            <div className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-[#008069]" />

            {/* Avatar */}
            <div className="relative flex-shrink-0 ml-1">
              {avatar ? (
                <img
                  src={avatar}
                  alt={title}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00a884]/40"
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-tr ${getAvatarColor(
                    notif.id
                  )} flex items-center justify-center font-bold text-white text-sm ring-2 ring-[#00a884]/40`}
                >
                  {getInitials(title)}
                </div>
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#25d366] border-2 border-white" />
            </div>

            {/* Notification content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-xs font-semibold text-[#111b21] truncate group-hover:text-[#008069] transition-colors">
                  {title}
                </h4>
                <span className="text-[10px] text-[#008069] font-medium">Just now</span>
              </div>
              <p className="text-xs text-[#667781] truncate mt-0.5">{body}</p>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notif.id);
              }}
              className="p-1 rounded-full text-[#8696a0] hover:text-[#111b21] hover:bg-[#e9edef] transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
