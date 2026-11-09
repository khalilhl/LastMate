"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Megaphone, AlertTriangle, Flame, Info, X } from "lucide-react";
import { AnnouncementItem } from "@/lib/types";

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          const active = (data.announcements || []).filter(
            (a: AnnouncementItem) => a.isActive
          );
          setAnnouncements(active);
        }
      } catch (err) {
        console.error("Failed to load active announcements:", err);
      }
    }
    fetchAnnouncements();
  }, []);

  // Do not render announcements inside the admin panel
  if (pathname?.startsWith("/admin")) return null;

  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.includes(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  const current = visibleAnnouncements[0];

  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  const getStyle = (type: string) => {
    switch (type) {
      case "MAINTENANCE":
        return {
          bar: "bg-amber-950/90 border-amber-500/40 text-amber-200",
          badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle,
        };
      case "PROMOTION":
        return {
          bar: "bg-purple-950/90 border-purple-500/40 text-purple-200",
          badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          icon: Flame,
        };
      case "WARNING":
        return {
          bar: "bg-rose-950/90 border-rose-500/40 text-rose-200",
          badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: AlertTriangle,
        };
      case "INFO":
      default:
        return {
          bar: "bg-[#15151C]/95 border-val-red/40 text-val-white",
          badge: "bg-val-red/20 text-val-red border-val-red/40",
          icon: Megaphone,
        };
    }
  };

  const style = getStyle(current.type);
  const Icon = style.icon;

  return (
    <div
      role="region"
      aria-label="Platform Announcement"
      className={`w-full border-b transition-all duration-300 px-4 py-2 sm:py-2.5 backdrop-blur-md relative z-50 ${style.bar}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${style.badge}`}
          >
            <Icon className="w-3 h-3 animate-pulse" />
            <span>{current.type}</span>
          </span>
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-val-white shrink-0">
              {current.title}
            </span>
            <span className="text-val-muted truncate hidden sm:inline">—</span>
            <span className="text-val-dim truncate hidden sm:inline">
              {current.content}
            </span>
          </div>
        </div>

        <button
          onClick={() => handleDismiss(current.id)}
          className="text-val-dim hover:text-val-white transition-colors p-1 rounded hover:bg-white/10 shrink-0"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

