"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  VALORANT_RANKS,
  VALORANT_SERVERS,
  VALORANT_ROLES,
  LANGUAGES,
} from "@/lib/constants";
import {
  Sparkles,
  Users,
  Mic,
  Shield,
  Send,
  AlertCircle,
  LogIn,
  Info,
} from "lucide-react";

export default function CreatePartyPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    partyCode: "",
    currentPlayers: 4,
    requiredRank: "Gold 1",
    averageRank: "Gold 2",
    preferredRole: "Any",
    server: "Frankfurt (EU Central)",
    language: "English",
    voiceChatRequired: true,
    description: "",
    discordContact: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!user) {
      setFormError("You must sign in to publish a party announcement.");
      return;
    }

    if (!formData.partyCode.trim()) {
      setFormError("VALORANT Party Code is required.");
      return;
    }

    if (!formData.requiredRank) {
      setFormError("Minimum required rank is required.");
      return;
    }

    if (!formData.server) {
      setFormError("Server region is required.");
      return;
    }

    if (formData.currentPlayers >= 5) {
      setFormError("A party looking for players must have at least one open slot (max 4 players).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim() || `${user.username}'s Party`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to publish party.");
        error(data.error || "Failed to publish party.");
      } else {
        success("Party announced! Your code is now live on LastMate.");
        router.push(`/parties/${data.party.id}`);
      }
    } catch {
      setFormError("Network error. Please try again.");
      error("Network error while publishing party.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full rounded-2xl bg-val-surface border border-val-border p-8 text-center shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-val-surfaceElevated border border-val-border flex items-center justify-center text-val-red mx-auto mb-4 shadow-val-glow-sm">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
            Authentication Required
          </h2>
          <p className="text-xs text-val-muted mt-2 mb-6 leading-relaxed">
            Please log in or register to publish your VALORANT squad code so you can manage your party status.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login?redirect=/parties/create"
              className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow transition-all"
            >
              Sign In to LastMate
            </Link>
            <Link
              href="/register"
              className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider border border-val-border text-val-white hover:bg-val-surfaceElevated transition-all"
            >
              Create An Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-val-red flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Squad Announcement
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
          Publish Your VALORANT Party
        </h1>
        <p className="text-xs sm:text-sm text-val-muted mt-1">
          Post your official party code. Other players can copy your code and join immediately inside the game.
        </p>
      </div>

      {/* Reminder Banner */}
      <div className="mb-8 p-4 rounded-xl bg-val-surfaceElevated/60 border border-val-border flex items-start gap-3 text-xs text-val-muted">
        <Info className="w-4 h-4 text-val-red shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-val-white">How to get your party code:</span>{" "}
          In VALORANT, open your Party window &rarr; Click party settings &rarr; Copy your official party code and paste it below.
        </div>
      </div>

      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-val-red/60 text-val-red text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-val-border bg-val-surface p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Section 1: Core Party Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-val-white border-b border-val-border/60 pb-2">
            1. Party Identity & Code
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Party Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`e.g. ${user.username}'s Ranked Push`}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Official VALORANT Party Code <span className="text-val-red">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.partyCode}
                onChange={(e) => setFormData({ ...formData, partyCode: e.target.value })}
                placeholder="e.g. 7A9K-219M or in-game code"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white font-mono text-sm tracking-wider font-bold rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red placeholder:font-sans placeholder:font-normal"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Current Players in Party <span className="text-val-red">*</span>
              </label>
              <select
                value={formData.currentPlayers}
                onChange={(e) =>
                  setFormData({ ...formData, currentPlayers: parseInt(e.target.value, 10) })
                }
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              >
                <option value={4}>4 / 5 players (Need 1 more)</option>
                <option value={3}>3 / 5 players (Need 2 more)</option>
                <option value={2}>2 / 5 players (Need 3 more)</option>
                <option value={1}>1 / 5 players (Solo hosting)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Minimum Rank Required <span className="text-val-red">*</span>
              </label>
              <select
                value={formData.requiredRank}
                onChange={(e) => setFormData({ ...formData, requiredRank: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Average Team Rank
              </label>
              <select
                value={formData.averageRank}
                onChange={(e) => setFormData({ ...formData, averageRank: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Matchmaking Requirements */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-val-white border-b border-val-border/60 pb-2">
            2. Matchmaking & Comms
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Preferred Role Needed
              </label>
              <select
                value={formData.preferredRole}
                onChange={(e) => setFormData({ ...formData, preferredRole: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
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
                Server Region <span className="text-val-red">*</span>
              </label>
              <select
                value={formData.server}
                onChange={(e) => setFormData({ ...formData, server: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_SERVERS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Communication Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Voice Chat Requirement
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, voiceChatRequired: true })}
                  className={`py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.voiceChatRequired
                      ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                      : "bg-val-surfaceElevated border-val-border text-val-muted"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>Mic Required</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, voiceChatRequired: false })}
                  className={`py-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    !formData.voiceChatRequired
                      ? "bg-val-surfaceElevated border-val-borderLight text-val-white"
                      : "bg-val-surfaceElevated border-val-border text-val-muted"
                  }`}
                >
                  <span>No Mic / Optional</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
                Discord Tag / Contact (Optional)
              </label>
              <input
                type="text"
                value={formData.discordContact}
                onChange={(e) => setFormData({ ...formData, discordContact: e.target.value })}
                placeholder="e.g. username#1234 or discord handle"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Extra Info */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-val-white border-b border-val-border/60 pb-2">
            3. Squad Description
          </h2>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Description / Notes for Teammates
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Chill competitive games, trying to get back to Ascendant. Good vibes only, no toxicity!"
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg p-3.5 placeholder:text-val-dim focus:outline-none focus:border-val-red"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-val-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-val-muted text-center sm:text-left">
            Once posted, your party code will be immediately visible on the public listings.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Publishing Party..." : "Publish Party Announcement"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

