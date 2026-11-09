"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { PartySummary } from "@/lib/types";
import {
  VALORANT_RANKS,
  VALORANT_ROLES,
  VALORANT_SERVERS,
  LANGUAGES,
} from "@/lib/constants";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "@/components/parties/RankBadge";
import RoleBadge from "@/components/parties/RoleBadge";
import ServerBadge from "@/components/parties/ServerBadge";
import PartyStatusBadge from "@/components/parties/PartyStatusBadge";
import CopyCodeButton from "@/components/parties/CopyCodeButton";
import EditPartyModal from "@/components/parties/EditPartyModal";
import DeleteConfirmModal from "@/components/parties/DeleteConfirmModal";
import {
  User,
  Shield,
  Calendar,
  Globe,
  MessageSquare,
  Edit,
  Trash2,
  PlusCircle,
  ExternalLink,
  Save,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile } = useAuth();
  const { success, error } = useToast();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    riotId: "",
    rank: "Gold 1",
    mainRole: "Duelist",
    preferredServer: "Frankfurt (EU Central)",
    languages: "English",
    discordUsername: "",
    bio: "",
  });

  const [userParties, setUserParties] = useState<PartySummary[]>([]);
  const [partiesLoading, setPartiesLoading] = useState(true);

  // Selected party for edit/delete
  const [selectedParty, setSelectedParty] = useState<PartySummary | null>(null);
  const [isEditPartyOpen, setIsEditPartyOpen] = useState(false);
  const [isDeletePartyOpen, setIsDeletePartyOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        riotId: user.riotId || "",
        rank: user.rank || "Gold 1",
        mainRole: user.mainRole || "Duelist",
        preferredServer: user.preferredServer || "Frankfurt (EU Central)",
        languages: user.languages || "English",
        discordUsername: user.discordUsername || "",
        bio: user.bio || "",
      });

      fetchUserParties(user.id);
    }
  }, [user]);

  const fetchUserParties = async (userId: string) => {
    try {
      const res = await fetch(`/api/parties?ownerId=${userId}&includeClosed=true`);
      if (res.ok) {
        const data = await res.json();
        setUserParties(data.parties || []);
      }
    } catch (err) {
      console.error("Error fetching user parties:", err);
    } finally {
      setPartiesLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile(profileForm);
    if (res.success) {
      success("Profile updated successfully!");
      setIsEditingProfile(false);
    } else {
      error(res.error || "Failed to update profile");
    }
  };

  const handleDeleteParty = async () => {
    if (!selectedParty) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/parties/${selectedParty.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        error(data.error || "Failed to delete party.");
      } else {
        success("Party deleted successfully.");
        setUserParties((prev) => prev.filter((p) => p.id !== selectedParty.id));
      }
    } catch {
      error("Network error deleting party.");
    } finally {
      setIsDeleting(false);
      setIsDeletePartyOpen(false);
      setSelectedParty(null);
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
          <h2 className="text-xl font-bold text-val-white mb-2">Sign In Required</h2>
          <p className="text-xs text-val-muted mb-6">
            Please log in to view and manage your profile and parties.
          </p>
          <Link
            href="/login?redirect=/profile"
            className="inline-block w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red text-white shadow-val-glow-sm"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
      {/* Profile Header Card */}
      <div className="rounded-2xl border border-val-border bg-val-surface p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-val-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-val-border/60">
          <div className="flex items-start gap-4">
            {/* Avatar block */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-val-surfaceElevated border-2 border-val-border flex items-center justify-center font-gaming text-3xl font-black text-val-red shadow-val-glow-sm shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
                  {user.username}
                </h1>
                <RankBadge rank={user.rank} size="md" />
              </div>

              {user.riotId && (
                <p className="text-xs font-mono font-bold text-val-muted">
                  Riot ID: <span className="text-val-white">{user.riotId}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-val-muted mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-val-dim" />
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="self-start px-4 py-2 rounded-lg border border-val-border bg-val-surfaceElevated hover:bg-val-border text-xs font-bold uppercase tracking-wider text-val-white transition-all flex items-center gap-2"
          >
            <Edit className="w-3.5 h-3.5 text-val-red" />
            <span>{isEditingProfile ? "Cancel Editing" : "Edit Profile"}</span>
          </button>
        </div>

        {/* Profile Edit Mode Form */}
        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="mt-6 space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-val-white">
              Edit Agent Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Riot ID
                </label>
                <input
                  type="text"
                  value={profileForm.riotId}
                  onChange={(e) => setProfileForm({ ...profileForm, riotId: e.target.value })}
                  placeholder="e.g. Phoenix#EUW"
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Current Rank
                </label>
                <select
                  value={profileForm.rank}
                  onChange={(e) => setProfileForm({ ...profileForm, rank: e.target.value })}
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
                >
                  {VALORANT_RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Main Role
                </label>
                <select
                  value={profileForm.mainRole}
                  onChange={(e) => setProfileForm({ ...profileForm, mainRole: e.target.value })}
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
                >
                  {VALORANT_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Preferred Server
                </label>
                <select
                  value={profileForm.preferredServer}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, preferredServer: e.target.value })
                  }
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
                >
                  {VALORANT_SERVERS.map((srv) => (
                    <option key={srv} value={srv}>
                      {srv}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={profileForm.languages}
                  onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                  placeholder="e.g. English, French"
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                  Discord Username
                </label>
                <input
                  type="text"
                  value={profileForm.discordUsername}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, discordUsername: e.target.value })
                  }
                  placeholder="e.g. agent#0001"
                  className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1">
                Bio / Playstyle Notes
              </label>
              <textarea
                rows={2}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                placeholder="Share your agent pool, playstyle, and climbing goals..."
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg p-3 focus:outline-none focus:border-val-red"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-val-muted hover:text-val-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        ) : (
          /* Profile Details View */
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-val-surfaceElevated/60 border border-val-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
                Main Role
              </span>
              <RoleBadge role={user.mainRole} size="md" />
            </div>

            <div className="p-3 rounded-lg bg-val-surfaceElevated/60 border border-val-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
                Home Server
              </span>
              <ServerBadge server={user.preferredServer} size="md" />
            </div>

            <div className="p-3 rounded-lg bg-val-surfaceElevated/60 border border-val-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
                Languages
              </span>
              <span className="text-xs font-bold text-val-white block truncate">
                {user.languages || "English"}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-val-surfaceElevated/60 border border-val-border/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block mb-1">
                Discord
              </span>
              <span className="text-xs font-bold text-val-white block truncate">
                {user.discordUsername || "Not connected"}
              </span>
            </div>

            {user.bio && (
              <div className="col-span-2 sm:col-span-4 p-3 rounded-lg bg-val-surfaceElevated/40 border border-val-border/40 text-xs text-val-muted">
                <span className="font-bold text-val-dim uppercase block text-[10px] mb-1">
                  Agent Bio
                </span>
                <p className="leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User's Published Parties Section */}
      <div id="parties" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
              My Published Party Announcements
            </h2>
            <p className="text-xs text-val-muted">
              Manage your party listings, update party status, or remove completed squads.
            </p>
          </div>

          <Link
            href="/parties/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Party</span>
          </Link>
        </div>

        {partiesLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-val-surface border border-val-border animate-pulse" />
            ))}
          </div>
        ) : userParties.length > 0 ? (
          <div className="space-y-3">
            {userParties.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-val-border bg-val-surface p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-val-borderLight transition-all"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/parties/${p.id}`}
                      className="text-base font-bold text-val-white hover:text-val-red transition-colors flex items-center gap-1.5"
                    >
                      <span>{p.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-val-dim" />
                    </Link>
                    <PartyStatusBadge status={p.status} />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-val-muted">
                    <span className="font-mono font-bold text-val-white">Code: {p.partyCode}</span>
                    <span>•</span>
                    <span>{p.currentPlayers}/{p.maxPlayers} players</span>
                    <span>•</span>
                    <span>Avg {p.averageRank}</span>
                    <span>•</span>
                    <span>{p.server.split(" ")[0]}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(p.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <CopyCodeButton code={p.partyCode} variant="subtle" showLabel={false} />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedParty(p);
                      setIsEditPartyOpen(true);
                    }}
                    className="p-2 rounded-lg border border-val-border text-val-muted hover:text-val-white hover:bg-val-surfaceElevated transition-colors"
                    title="Edit Party"
                  >
                    <Edit className="w-4 h-4 text-cyan-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedParty(p);
                      setIsDeletePartyOpen(true);
                    }}
                    className="p-2 rounded-lg border border-rose-900/50 bg-rose-950/20 text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Delete Party"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-val-border bg-val-surface p-8">
            <Shield className="w-10 h-10 text-val-dim mx-auto mb-2" />
            <h3 className="text-sm font-bold text-val-white">You haven&apos;t posted any parties yet</h3>
            <p className="text-xs text-val-muted mt-1 mb-4">
              Generate a party code inside VALORANT and publish it to find teammates.
            </p>
            <Link
              href="/parties/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red text-white shadow-val-glow-sm"
            >
              Post a Party
            </Link>
          </div>
        )}
      </div>

      {/* Modals for party editing/deleting */}
      {selectedParty && (
        <>
          <EditPartyModal
            party={selectedParty}
            isOpen={isEditPartyOpen}
            onClose={() => {
              setIsEditPartyOpen(false);
              setSelectedParty(null);
            }}
            onSuccess={(updated) => {
              setUserParties((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
              );
            }}
          />

          <DeleteConfirmModal
            partyName={selectedParty.name}
            isOpen={isDeletePartyOpen}
            isDeleting={isDeleting}
            onConfirm={handleDeleteParty}
            onClose={() => {
              setIsDeletePartyOpen(false);
              setSelectedParty(null);
            }}
          />
        </>
      )}
    </div>
  );
}

