"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PartySummary } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import RoleBadge from "@/components/parties/RoleBadge";
import ServerBadge from "@/components/parties/ServerBadge";
import PartyStatusBadge from "@/components/parties/PartyStatusBadge";
import PartyCodeDisplay from "@/components/parties/PartyCodeDisplay";
import ReportModal from "@/components/parties/ReportModal";
import EditPartyModal from "@/components/parties/EditPartyModal";
import DeleteConfirmModal from "@/components/parties/DeleteConfirmModal";
import {
  ArrowLeft,
  Users,
  Mic,
  MicOff,
  Globe,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Edit,
  Trash2,
  Share2,
  Clock,
  Sparkles,
  RefreshCw,
  Lock,
} from "lucide-react";

export default function PartyDetailsPage() {
  const params = useParams();
  const partyId = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [party, setParty] = useState<PartySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Expiration countdown
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpiredLocal, setIsExpiredLocal] = useState<boolean>(false);

  // Host code refresh modal / state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshModalOpen, setRefreshModalOpen] = useState(false);
  const [newPartyCodeInput, setNewPartyCodeInput] = useState("");

  useEffect(() => {
    async function fetchParty() {
      try {
        const res = await fetch(`/api/parties/${partyId}`);
        if (!res.ok) {
          setParty(null);
        } else {
          const data = await res.json();
          setParty(data.party);
          if (data.party?.partyCode) {
            setNewPartyCodeInput(data.party.partyCode);
          }
        }
      } catch (err) {
        console.error("Fetch party details error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (partyId) {
      fetchParty();
    }
  }, [partyId]);

  // Live countdown timer for 60-minute expiration
  useEffect(() => {
    if (!party || party.partyType === "DEMO" || !party.expiresAt) {
      setTimeRemaining("");
      return;
    }

    function calculateRemaining() {
      if (!party?.expiresAt) return;
      const expireTime = new Date(party.expiresAt).getTime();
      const now = Date.now();
      const diff = expireTime - now;

      if (diff <= 0) {
        setTimeRemaining("Expired (60m elapsed)");
        setIsExpiredLocal(true);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${mins}m ${secs < 10 ? "0" : ""}${secs}s`);
        setIsExpiredLocal(false);
      }
    }

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [party]);

  const isOwner = user && party && user.id === party.ownerId;
  const isDemo = party?.partyType === "DEMO";
  const isFull =
    (party && (party.currentPlayers >= party.maxPlayers || party.status === "Full" || party.status === "FULL")) ||
    isDemo;
  const isExpired =
    party?.status === "EXPIRED" || Boolean(party?.isExpired) || isExpiredLocal;

  const handleDelete = async () => {
    if (!party) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/parties/${party.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        error(data.error || "Failed to delete party.");
      } else {
        success("Party announcement removed.");
        router.push("/parties");
      }
    } catch {
      error("Network error deleting party.");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    if (!party) return;
    try {
      const res = await fetch(`/api/parties/${party.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setParty(data.party);
        success(`Status updated to "${newStatus}"!`);
      } else {
        error(data.error || "Failed to update status");
      }
    } catch {
      error("Network error");
    }
  };

  const handleRefreshCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!party) return;
    setIsRefreshing(true);

    try {
      const res = await fetch(`/api/parties/${party.id}/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyCode: newPartyCodeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setParty(data.party);
        setRefreshModalOpen(false);
        setIsExpiredLocal(false);
        success("Party code refreshed! Valid for the next 60 minutes.");
      } else {
        error(data.error || "Failed to refresh party code");
      }
    } catch {
      error("Network error refreshing party code");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        success("Link copied to clipboard!");
      } catch {
        error("Could not copy link.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!party) {
    return (
      <div className="min-h-screen py-20 px-4 text-center max-w-md mx-auto">
        <ShieldAlert className="w-12 h-12 text-val-red mx-auto mb-3" />
        <h2 className="text-xl font-bold text-val-white">Party Not Found</h2>
        <p className="text-xs text-val-muted mt-2 mb-6">
          This party announcement does not exist or may have been deleted by the party leader.
        </p>
        <Link
          href="/parties"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red text-white shadow-val-glow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Party List</span>
        </Link>
      </div>
    );
  }

  const availableSlots = Math.max(0, party.maxPlayers - party.currentPlayers);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back button & Owner Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/parties"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-val-muted hover:text-val-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Parties</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-val-border bg-val-surface hover:bg-val-surfaceElevated text-xs font-semibold text-val-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-val-muted" />
            <span>Share</span>
          </button>

          {isOwner ? (
            <>
              <button
                type="button"
                onClick={() => setRefreshModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-xs font-semibold text-emerald-400 transition-colors shadow-val-glow-sm"
                title="Reset 60-Minute Party Code Validity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Code</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-val-border bg-val-surface hover:bg-val-surfaceElevated text-xs font-semibold text-val-white transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-900/50 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-semibold text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </>
          ) : !isDemo ? (
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-val-border bg-val-surface hover:bg-val-surfaceElevated text-xs font-semibold text-val-muted hover:text-rose-400 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report Party</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Demo Squad Notice Banner */}
      {isDemo && (
        <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold uppercase tracking-wider block text-amber-300">
              Simulated Demo Squad (5/5 Players)
            </span>
            <span>
              This is an automated fictional demonstration squad generated for community activity preview. It is locked with 5/5 players, has no joinable Riot party code, and rotates every 15 minutes.
            </span>
          </div>
        </div>
      )}

      {/* Owner Fast Status Bar */}
      {isOwner && (
        <div className="p-4 rounded-xl bg-val-surfaceElevated/70 border border-val-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-val-white">You are the host of this party.</span>{" "}
            <span className="text-val-muted">Quick update party status:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickStatusChange("Looking for players")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                party.status === "Looking for players"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "bg-val-surface border border-val-border text-emerald-400 hover:bg-emerald-950/30"
              }`}
            >
              Looking for players
            </button>
            <button
              onClick={() => handleQuickStatusChange("Full")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                party.status === "Full" || party.status === "FULL"
                  ? "bg-amber-500 text-black shadow-sm"
                  : "bg-val-surface border border-val-border text-amber-400 hover:bg-amber-950/30"
              }`}
            >
              Mark as Full
            </button>
            <button
              onClick={() => handleQuickStatusChange("In Game")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                party.status === "In Game"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-val-surface border border-val-border text-indigo-400 hover:bg-indigo-950/30"
              }`}
            >
              Mark In Game
            </button>
            <button
              onClick={() => handleQuickStatusChange("Closed")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                party.status === "Closed"
                  ? "bg-zinc-600 text-white shadow-sm"
                  : "bg-val-surface border border-val-border text-val-muted hover:bg-zinc-800"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Party Hero Card */}
      <div className="rounded-2xl border border-val-border bg-val-surface p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-val-border/70">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <PartyStatusBadge status={isExpired ? "Expired" : isFull ? "Full" : party.status} />
              <span className="text-xs text-val-muted flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Published {formatTimeAgo(party.createdAt)}
              </span>

              {/* 60-Minute Expiration Live Timer */}
              {!isDemo && timeRemaining && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider border ${
                    isExpired
                      ? "bg-rose-500/15 text-rose-400 border-rose-500/30"
                      : "bg-val-surfaceElevated text-amber-300 border-val-border"
                  }`}
                  title="Official Party codes expire exactly 60 minutes after publication"
                >
                  <Clock className="w-3 h-3 text-val-red animate-pulse" />
                  <span>Code Validity: {timeRemaining}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
              {party.name}
            </h1>
            <p className="text-xs text-val-muted mt-2">
              Hosted by{" "}
              <span className="font-semibold text-val-white">
                {party.owner?.username || (isDemo ? "LastMate Squads" : "Host")}
              </span>{" "}
              {party.owner?.riotId && `(${party.owner.riotId})`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Team Avg Rank
              </span>
              <RankBadge rank={party.averageRank} size="lg" />
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Min Required
              </span>
              <RankBadge rank={party.requiredRank} size="lg" />
            </div>
          </div>
        </div>

        {/* CODE DISPLAY PROMINENT (with Full Squad & Expired Protection) */}
        <div className="my-8">
          <PartyCodeDisplay
            code={party.partyCode}
            partyId={party.id}
            size="lg"
            isFull={isFull}
            isExpired={isExpired}
            isDemo={isDemo}
          />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-val-surfaceElevated/50 border border-val-border/60">
          {/* Slots */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
              Squad Slots
            </span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-val-muted" />
              <span className="text-sm font-bold text-val-white">
                {party.currentPlayers} / {party.maxPlayers}
              </span>
              <span className={`text-xs font-semibold ${isFull ? "text-amber-400" : "text-val-red"}`}>
                ({isFull ? "Full" : `${availableSlots} open`})
              </span>
            </div>
          </div>

          {/* Role */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
              Role Needed
            </span>
            <RoleBadge role={party.preferredRole} size="md" />
          </div>

          {/* Server */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
              Server Region
            </span>
            <ServerBadge server={party.server} size="md" />
          </div>

          {/* Voice Chat */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
              Voice Comms
            </span>
            <div
              className={`flex items-center gap-1.5 text-xs font-bold ${
                party.voiceChatRequired ? "text-emerald-400" : "text-val-muted"
              }`}
            >
              {party.voiceChatRequired ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Mic Required</span>
                </>
              ) : (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Optional / No Mic</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-8 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-val-dim">
            Squad Description & Guidelines
          </h2>
          <div className="p-4 rounded-xl bg-val-black/40 border border-val-border/60 text-sm text-val-white/90 leading-relaxed whitespace-pre-line">
            {party.description || "No specific instructions provided by the squad host. Jump in and play your best!"}
          </div>
        </div>

        {/* Contact info if present */}
        {party.discordContact && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-indigo-300">
              <MessageSquare className="w-4 h-4" />
              <span>
                Host Discord / Contact: <strong className="text-val-white">{party.discordContact}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(party.discordContact || "");
                success("Discord handle copied!");
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 underline"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Refresh Code Modal (Host Only) */}
      {refreshModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl bg-val-surface border border-val-border p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <RefreshCw className="w-5 h-5" />
              <h3 className="text-base font-bold text-val-white">
                Refresh Official VALORANT Party Code
              </h3>
            </div>
            <p className="text-xs text-val-muted leading-relaxed mb-4">
              Refreshing your party code resets its 60-minute expiration timer, removes the expired state, and makes your squad joinable by teammates again.
            </p>

            <form onSubmit={handleRefreshCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                  In-Game VALORANT Party Code <span className="text-val-red">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newPartyCodeInput}
                  onChange={(e) => setNewPartyCodeInput(e.target.value)}
                  placeholder="e.g. EUW-84920-VAL"
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 font-mono focus:outline-none focus:border-emerald-400"
                />
                <span className="text-[10px] text-val-dim block mt-1">
                  Generate the official code inside VALORANT → Party → Share Party Code.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-val-border">
                <button
                  type="button"
                  onClick={() => setRefreshModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-val-muted hover:text-val-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRefreshing || !newPartyCodeInput.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-black shadow-sm disabled:opacity-50"
                >
                  {isRefreshing ? "Refreshing..." : "Reset 60m Expiration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportModal
        partyId={party.id}
        partyName={party.name}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <EditPartyModal
        party={party}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={(updated) => setParty(updated)}
      />

      <DeleteConfirmModal
        partyName={party.name}
        isOpen={isDeleteOpen}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
