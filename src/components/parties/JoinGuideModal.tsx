"use client";

import React from "react";
import { X, CheckCircle2, Copy, Gamepad2, Sparkles, HelpCircle } from "lucide-react";
import CopyCodeButton from "./CopyCodeButton";

interface JoinGuideModalProps {
  partyCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinGuideModal({
  partyCode,
  isOpen,
  onClose,
}: JoinGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-val-surface border border-val-border p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-val-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-val-red/10 border border-val-red/30 flex items-center justify-center text-val-red">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-val-white">How to Join In-Game</h3>
              <p className="text-[11px] text-val-muted">Using your copied VALORANT Party Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-val-muted hover:text-val-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Reminder Bar */}
        <div className="my-5 p-3.5 rounded-xl bg-val-surfaceElevated border border-val-border flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-val-dim block">
              Squad Party Code
            </span>
            <span className="font-mono text-base font-bold text-val-white tracking-widest">
              {partyCode}
            </span>
          </div>
          <CopyCodeButton code={partyCode} variant="primary" showLabel={true} />
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-3.5 text-xs">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-val-black/40 border border-val-border/60">
            <span className="w-5 h-5 rounded-full bg-val-red/20 text-val-red border border-val-red/40 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <h4 className="font-bold text-val-white">Launch VALORANT</h4>
              <p className="text-val-muted mt-0.5 leading-relaxed">
                Open the game client and navigate to the main <strong>Play</strong> / Lobby screen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-val-black/40 border border-val-border/60">
            <span className="w-5 h-5 rounded-full bg-val-red/20 text-val-red border border-val-red/40 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <h4 className="font-bold text-val-white">Click &ldquo;Join Party with Code&rdquo;</h4>
              <p className="text-val-muted mt-0.5 leading-relaxed">
                In your Party panel or social drawer, look for the option to enter an external squad code.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-val-black/40 border border-val-border/60">
            <span className="w-5 h-5 rounded-full bg-val-red/20 text-val-red border border-val-red/40 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <h4 className="font-bold text-val-white">Paste & Connect</h4>
              <p className="text-val-muted mt-0.5 leading-relaxed">
                Press <code className="px-1.5 py-0.5 rounded bg-val-surface border border-val-border text-val-white font-mono">Ctrl + V</code> to paste the code, then click Join. You will be placed right into the lobby!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-val-border/60 flex items-center justify-between">
          <span className="text-[11px] text-val-dim">
            No friend requests or Discord servers needed.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-surfaceElevated border border-val-border text-val-white hover:bg-val-border transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

