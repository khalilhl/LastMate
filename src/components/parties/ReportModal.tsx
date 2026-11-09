"use client";

import React, { useState } from "react";
import { Flag, X, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ReportModalProps {
  partyId: string;
  partyName: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Invalid or expired party code",
  "Party is already full or host is AFK",
  "Inappropriate or offensive party name/description",
  "Rank or server does not match announcement",
  "Toxic behavior / Hate speech in game",
  "Spam or advertising",
  "Other issue",
];

export default function ReportModal({
  partyId,
  partyName,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/parties/${partyId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to submit report.");
      } else {
        success("Report received. Thanks for keeping our community safe!");
        onClose();
      }
    } catch {
      error("Network error while submitting report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-val-surface border border-val-border p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-val-border/60">
          <div className="flex items-center gap-2 text-val-red">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-val-white">Report Party</h3>
          </div>
          <button
            onClick={onClose}
            className="text-val-muted hover:text-val-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-xs text-val-muted">
            Reporting: <span className="text-val-white font-semibold">{partyName}</span>
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Additional Details (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Provide more context so our moderators can investigate..."
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg p-3 placeholder:text-val-dim focus:outline-none focus:border-val-red"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-val-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-val-muted hover:text-val-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

