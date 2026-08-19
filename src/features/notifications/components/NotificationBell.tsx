"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { AppNotification, NotificationType } from "../types/notification-types";
import {
  useUnreadCountQuery,
  useNotificationsListQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "../hooks/use-notifications-queries";

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "leave_request":
      return <Calendar className="w-4 h-4 text-indigo-400" />;
    case "leave_approval":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "leave_rejection":
      return <XCircle className="w-4 h-4 text-rose-400" />;
    case "timesheet_submission":
      return <Clock className="w-4 h-4 text-sky-400" />;
    case "timesheet_approval":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "timesheet_rejection":
      return <XCircle className="w-4 h-4 text-rose-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-purple-400" />;
  }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const { data: notifications = [], isLoading } = useNotificationsListQuery({
    enabled: isOpen,
    limit: 25,
  });

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  const handleToggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    await markAllReadMutation.mutateAsync();
  };

  const handleItemClick = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markReadMutation.mutateAsync(notification.id);
    }

    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none transition-all duration-200 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-black text-white shadow-lg shadow-indigo-500/50 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="text-[11px] font-medium text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-2 text-slate-500">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-300">All caught up!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No new notifications right now.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-800/50 ${
                    !notif.is_read ? "bg-indigo-500/5" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-semibold truncate ${!notif.is_read ? "text-white" : "text-slate-300"}`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    {notif.link && (
                      <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-medium mt-1">
                        <span>View details</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
