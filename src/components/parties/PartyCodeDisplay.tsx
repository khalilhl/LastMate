"use client";

import React, { useState } from "react";
import CopyCodeButton from "./CopyCodeButton";
import JoinGuideModal from "./JoinGuideModal";
import { Info, Sparkles, HelpCircle, Lock, Clock, AlertCircle } from "lucide-react";

interface PartyCodeDisplayProps {
  code?: string | null;
  partyId?: string;
  size?: "md" | "lg";
  isFull?: boolean;
  isExpired?: boolean;
  isDemo?: boolean;
}

export default function PartyCodeDisplay({
  code,
  partyId,
  size = "md",
  isFull = false,
  isExpired = false,
  isDemo = false,
}: PartyCodeDisplayProps) {
  const [guideOpen, setGuideOpen] = useState(false);

  const shouldHide = isFull || isDemo || !code;

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-val-border bg-gradient-to-r from-val-surface to-val-surfaceElevated p-4 sm:p-5 shadow-lg">
        <div
          className={`absolute top-0 left-0 h-1 w-full ${
            isExpired
              ? "bg-rose-500"
              : isFull
              ? "bg-amber-500"
              : "bg-gradient-to-r from-val-red via-rose-500 to-cyan-400"
          }`}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold tracking-widest uppercase text-val-muted flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-val-red" />
                VALORANT Party Code
              </span>
              {isDemo && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Demo Party
                </span>
              )}
              {isFull && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Squad Full (5/5)
                </span>
              )}
              {isExpired && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Code Expired
                </span>
              )}
            </div>

            {shouldHide ? (
              <div className="flex items-center gap-2.5 py-1">
                <div className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-xl sm:text-2xl font-black text-zinc-500 blur-[3px] select-none tracking-widest">
                    VAL-••••-••••
                  </span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {isDemo
                      ? "Fictional demo squad — no official code available."
                      : "Party code hidden because squad is full (5/5)."}
                  </span>
                </div>
              </div>
            ) : isExpired ? (
              <div className="flex items-center gap-2 py-1">
                <Clock className="w-5 h-5 text-rose-400" />
                <span className="font-mono text-lg font-bold text-rose-300">
                  CODE EXPIRED (60m elapsed)
                </span>
              </div>
            ) : (
              <div
                className={`font-mono font-black tracking-widest text-val-white selection:bg-val-red selection:text-white ${
                  size === "lg" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
                }`}
              >
                {code}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <CopyCodeButton
              code={code}
              partyId={partyId}
              variant="primary"
              className="w-full sm:w-auto px-5 py-2.5 text-sm"
              isFull={isFull}
              isExpired={isExpired}
            />
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-val-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-val-muted">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-val-red shrink-0 mt-0.5" />
            <span>
              {shouldHide
                ? "This party already has 5 players and is closed to new joins."
                : isExpired
                ? "The party leader can refresh the party code to reopen matchmaking."
                : "Open VALORANT → Party lobby → 'Join Party with Code' → Paste code."}
            </span>
          </div>

          {!shouldHide && !isExpired && (
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] font-semibold text-val-white hover:text-val-red transition-colors underline underline-offset-4"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>How to enter code</span>
            </button>
          )}
        </div>
      </div>

      {!shouldHide && code && (
        <JoinGuideModal
          partyCode={code}
          isOpen={guideOpen}
          onClose={() => setGuideOpen(false)}
        />
      )}
    </>
  );
}
