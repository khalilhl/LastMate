"use client";

import React, { useState, useEffect } from "react";
import { AnnouncementItem } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import {
  Megaphone,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Flame,
  Wrench,
  X,
} from "lucide-react";

export default function AdminContentPage() {
  const { success, error } = useToast();

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "INFO" as "INFO" | "WARNING" | "MAINTENANCE" | "PROMO",
    isActive: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      title: "",
      content: "",
      type: "INFO",
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content,
      type: item.type,
      isActive: item.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const method = editingItem ? "PATCH" : "POST";
      const payload = editingItem ? { id: editingItem.id, ...form } : form;

      const res = await fetch("/api/admin/content", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to save announcement");
      } else {
        success(editingItem ? "Announcement updated." : "Announcement created.");
        setModalOpen(false);
        fetchAnnouncements();
      }
    } catch {
      error("Network error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (item: AnnouncementItem) => {
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          isActive: !item.isActive,
        }),
      });

      if (res.ok) {
        success(`Announcement ${!item.isActive ? "activated" : "deactivated"}.`);
        fetchAnnouncements();
      }
    } catch {
      error("Network error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const res = await fetch(`/api/admin/content?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success("Announcement deleted.");
        fetchAnnouncements();
      } else {
        error("Failed to delete announcement");
      }
    } catch {
      error("Network error");
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        );
      case "MAINTENANCE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <Wrench className="w-3 h-3" />
            Maintenance
          </span>
        );
      case "PROMO":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Flame className="w-3 h-3" />
            Featured
          </span>
        );
      case "INFO":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Info className="w-3 h-3" />
            Notice
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-gaming text-val-white">
            Website Content & Notices
          </h2>
          <p className="text-xs text-val-muted">
            Manage site-wide promotional banners, maintenance alerts, and homepage notices.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-val-red hover:bg-val-redHover text-white text-xs font-bold uppercase tracking-wider shadow-val-glow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Notice / Banner</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#15151C] border border-[#23232E] animate-pulse" />
          ))
        ) : announcements.length > 0 ? (
          announcements.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all ${
                item.isActive
                  ? "bg-[#15151C] border-[#2E2E3E]"
                  : "bg-[#111116] border-[#1F1F28] opacity-60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getTypeBadge(item.type)}
                    <h3 className="text-base font-bold text-val-white truncate">
                      {item.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                      }`}
                    >
                      {item.isActive ? "Live on site" : "Draft / Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-val-muted leading-relaxed whitespace-pre-line">
                    {item.content}
                  </p>
                  <div className="text-[10px] font-mono text-val-dim flex items-center gap-3 pt-1">
                    <span>Created by: {item.createdBy || "Admin"}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      item.isActive
                        ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                        : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60"
                    }`}
                  >
                    {item.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 rounded-lg border border-[#2E2E3E] bg-[#1D1D27] text-cyan-400 hover:text-cyan-300 transition-colors"
                    title="Edit announcement"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg border border-rose-950 bg-rose-950/40 text-rose-500 hover:bg-rose-900 transition-colors"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center rounded-xl bg-[#15151C] border border-[#23232E] text-val-dim text-xs">
            No announcements created yet. Click &ldquo;New Notice / Banner&rdquo; to broadcast to the community.
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#15151C] border border-[#23232E] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23232E]">
              <h3 className="text-base font-bold text-val-white">
                {editingItem ? "Edit Announcement" : "Create New Notice / Banner"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-val-muted hover:text-val-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Scheduled Matchmaking Maintenance"
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Notice Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as any })
                  }
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg px-3 py-2"
                >
                  <option value="INFO">Information / Notice</option>
                  <option value="PROMO">Promotional / Highlight</option>
                  <option value="WARNING">Warning / Rule Reminder</option>
                  <option value="MAINTENANCE">Maintenance Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write clear instructions or notice information for agents..."
                  className="w-full bg-[#1D1D27] border border-[#2E2E3E] text-val-white rounded-lg p-3"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#1D1D27] border-[#2E2E3E] text-val-red focus:ring-val-red"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-val-white cursor-pointer">
                  Activate immediately on website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#23232E]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm"
                >
                  {isProcessing ? "Saving..." : "Save Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

