"use client";

import React from "react";
import { AlertOctagon, X } from "lucide-react";

interface DeleteConfirmModalProps {
  partyName: string;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({
  partyName,
  isOpen,
  isDeleting,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-xl bg-val-surface border border-val-red/40 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-val-border/60">
          <div className="flex items-center gap-2.5 text-val-red">
            <AlertOctagon className="w-5 h-5 text-val-red shrink-0" />
            <h3 className="text-base font-bold text-val-white">Delete Announcement</h3>
          </div>
          <button
            onClick={onClose}
            className="text-val-muted hover:text-val-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-2">
          <p className="text-sm text-val-white">
            Are you sure you want to delete <span className="font-bold text-val-red">&ldquo;{partyName}&rdquo;</span>?
          </p>
          <p className="text-xs text-val-muted leading-relaxed">
            This action cannot be undone. Players searching the platform will immediately stop seeing this party code.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-val-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-val-muted hover:text-val-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-val-glow-sm disabled:opacity-50 transition-all"
          >
            {isDeleting ? "Deleting..." : "Delete Party"}
          </button>
        </div>
      </div>
    </div>
  );
}

