
"use client";

import React, { useState } from "react";
import { PartySummary } from "@/lib/types";
import { VALORANT_ROLES, VALORANT_RANKS } from "@/lib/constants";
import { X, Edit3, Save } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface EditPartyModalProps {
  party: PartySummary;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: PartySummary) => void;
}

export default function EditPartyModal({
  party,
  isOpen,
  onClose,
  onSuccess,
}: EditPartyModalProps) {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    name: party.name,
    partyCode: party.partyCode || "",
    currentPlayers: party.currentPlayers,
    status: party.status,
    preferredRole: party.preferredRole,
    voiceChatRequired: party.voiceChatRequired,
    description: party.description,
    discordContact: party.discordContact || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePlayersChange = (val: number) => {
    let nextStatus = formData.status;
    if (val === 5) {
      nextStatus = "Full";
    } else if (val < 5 && formData.status === "Full") {
      nextStatus = "Looking for players";
    }

    setFormData({
      ...formData,
      currentPlayers: val,
      status: nextStatus,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/parties/${party.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to update party");
      } else {
        success("Party announcement updated!");
        onSuccess(data.party);
        onClose();
      }
    } catch {
      error("Network error updating party");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-xl bg-val-surface border border-val-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-val-border/60">
          <div className="flex items-center gap-2 text-val-red">
            <Edit3 className="w-5 h-5" />
            <h3 className="text-base font-bold text-val-white">Manage Party Announcement</h3>
          </div>
          <button
            onClick={onClose}
            className="text-val-muted hover:text-val-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Party Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              VALORANT Party Code
            </label>
            <input
              type="text"
              required
              value={formData.partyCode}
              onChange={(e) => setFormData({ ...formData, partyCode: e.target.value })}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white font-mono text-sm tracking-wider rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Current Players ({formData.currentPlayers}/5)
              </label>
              <select
                value={formData.currentPlayers}
                onChange={(e) => handlePlayersChange(parseInt(e.target.value, 10))}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} / 5 players
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Party Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                <option value="Looking for players">Looking for players</option>
                <option value="Full">Full (5/5)</option>
                <option value="In Game">In Game</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Preferred Role
              </label>
              <select
                value={formData.preferredRole}
                onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Voice Chat
              </label>
              <select
                value={formData.voiceChatRequired ? "yes" : "no"}
                onChange={(e) =>
                  setFormData({ ...formData, voiceChatRequired: e.target.value === "yes" })
                }
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                <option value="yes">Mic Required</option>
                <option value="no">Voice Optional / No Mic</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Discord / Contact (Optional)
            </label>
            <input
              type="text"
              value={formData.discordContact}
              onChange={(e) => setFormData({ ...formData, discordContact: e.target.value })}
              placeholder="e.g. your_discord_tag"
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

