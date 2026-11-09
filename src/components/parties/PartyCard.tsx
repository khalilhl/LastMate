"use client";

import React from "react";
import Link from "next/link";
import { PartySummary } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import RankBadge from "./RankBadge";
import RoleBadge from "./RoleBadge";
import ServerBadge from "./ServerBadge";
import PartyStatusBadge from "./PartyStatusBadge";
import CopyCodeButton from "./CopyCodeButton";
import { Mic, MicOff, Users, ArrowUpRight, Lock, Clock, Sparkles } from "lucide-react";

interface PartyCardProps {
  party: PartySummary;
}

export default function PartyCard({ party }: PartyCardProps) {
  const isDemo = party.partyType === "DEMO";
  const isFull = party.currentPlayers >= party.maxPlayers || party.status === "Full" || party.status === "FULL" || isDemo;
  const isExpired = party.status === "EXPIRED" || Boolean(party.isExpired);
  const availableSlots = Math.max(0, party.maxPlayers - party.currentPlayers);

  return (
    <div className="group relative rounded-xl border border-val-border bg-val-surface hover:bg-val-surfaceHover transition-all duration-200 hover:border-val-borderLight hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden">
      {/* Top red highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-gradient-to-r group-hover:from-val-red group-hover:via-rose-500 group-hover:to-cyan-400 transition-all duration-300" />

      {/* Header section */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <Link
              href={`/parties/${party.id}`}
              className="text-lg font-bold text-val-white hover:text-val-red transition-colors flex items-center gap-1.5 truncate group/title"
            >
              <span className="truncate">{party.name}</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 -translate-y-1 translate-x-1 group-hover/title:opacity-100 group-hover/title:translate-y-0 group-hover/title:translate-x-0 transition-all text-val-red shrink-0" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-val-muted mt-1">
              <span>By {party.owner?.username || (isDemo ? "LastMate Squads" : "Host")}</span>
              <span>•</span>
              <span>{formatTimeAgo(party.createdAt)}</span>
              {isDemo && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>DEMO</span>
                  </span>
                </>
              )}
            </div>
          </div>
          <PartyStatusBadge status={isExpired ? "Expired" : isFull ? "Full" : party.status} />
        </div>

        {/* Description */}
        <p className="text-xs text-val-muted line-clamp-2 mt-2 leading-relaxed h-8">
          {party.description || "No extra description provided. Join to complete the squad!"}
        </p>

        {/* Badges bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-val-border/60">
          <div className="flex items-center gap-1.5" title="Team Average Rank">
            <span className="text-[11px] font-semibold text-val-muted uppercase">Avg:</span>
            <RankBadge rank={party.averageRank} size="sm" />
          </div>

          <div className="flex items-center gap-1.5" title="Minimum Required Rank">
            <span className="text-[11px] font-semibold text-val-muted uppercase">Min:</span>
            <RankBadge rank={party.requiredRank} size="sm" />
          </div>

          <RoleBadge role={party.preferredRole} size="sm" />
          <ServerBadge server={party.server} size="sm" />
        </div>
      </div>

      {/* Mid section: slots & details */}
      <div className="px-5 py-3 bg-val-surfaceElevated/50 border-t border-val-border/40 flex items-center justify-between text-xs">
        {/* Player Count & Dots */}
        <div className="flex items-center gap-2" title={`${party.currentPlayers}/${party.maxPlayers} players`}>
          <Users className="w-3.5 h-3.5 text-val-muted" />
          <div className="flex items-center gap-1">
            <span className="font-bold text-val-white">{party.currentPlayers}/{party.maxPlayers}</span>
            <span className="text-[11px] text-val-muted">
              ({isFull ? "Full" : `Need ${availableSlots}`})
            </span>
          </div>
          {/* Visual slot dots */}
          <div className="flex items-center gap-1 ml-1">
            {Array.from({ length: party.maxPlayers }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < party.currentPlayers
                    ? isDemo ? "bg-amber-400" : "bg-val-red"
                    : "bg-val-border border border-val-borderLight animate-pulse"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Voice & language */}
        <div className="flex items-center gap-3">
          <span className="text-val-dim font-medium">{party.language}</span>
          <div
            className={`flex items-center gap-1 font-semibold ${
              party.voiceChatRequired ? "text-emerald-400" : "text-val-muted"
            }`}
            title={party.voiceChatRequired ? "Voice Chat Required" : "Voice Chat Optional"}
          >
            {party.voiceChatRequired ? (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Mic Req</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-val-muted/70" />
                <span>No Mic</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer with Code & Copy Button */}
      <div className="p-4 bg-val-black/40 border-t border-val-border flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block">
            Party Code
          </span>
          {isFull ? (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-mono text-xs text-zinc-500 blur-[2px] select-none">
                VAL-••••-••••
              </span>
              <span className="text-[9px] font-mono font-bold uppercase text-zinc-400 bg-zinc-800/80 px-1 rounded border border-zinc-700">
                LOCKED
              </span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-1 text-zinc-500 text-xs font-mono">
              <Clock className="w-3 h-3 text-zinc-500" />
              <span>EXPIRED</span>
            </div>
          ) : (
            <span className="font-mono text-sm font-bold tracking-wider text-val-white truncate block">
              {party.partyCode}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <CopyCodeButton
            code={party.partyCode}
            partyId={party.id}
            variant="primary"
            showLabel={true}
            isFull={isFull}
            isExpired={isExpired}
          />
        </div>
      </div>
    </div>
  );
}
