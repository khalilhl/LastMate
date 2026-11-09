import React from "react";
import { PartyStatus } from "@/lib/types";

interface PartyStatusBadgeProps {
  status: PartyStatus | string;
}

export default function PartyStatusBadge({ status }: PartyStatusBadgeProps) {
  switch (status) {
    case "Looking for players":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Looking for players
        </span>
      );
    case "Full":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Party Full (5/5)
        </span>
      );
    case "In Game":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          In Game
        </span>
      );
    case "Closed":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-400 border border-zinc-700/50">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          Closed
        </span>
      );
  }
}

