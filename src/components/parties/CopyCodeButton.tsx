"use client";

import React, { useState } from "react";
import { Copy, Check, Lock } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface CopyCodeButtonProps {
  code?: string | null;
  partyId?: string;
  className?: string;
  variant?: "primary" | "secondary" | "subtle";
  showLabel?: boolean;
  isFull?: boolean;
  isExpired?: boolean;
  disabled?: boolean;
}

export default function CopyCodeButton({
  code,
  partyId,
  className = "",
  variant = "primary",
  showLabel = true,
  isFull = false,
  isExpired = false,
  disabled = false,
}: CopyCodeButtonProps) {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const isDisabled = disabled || isFull || isExpired || !code;

  if (isDisabled) {
    return (
      <button
        type="button"
        disabled
        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md font-bold text-xs tracking-wider uppercase opacity-75 cursor-not-allowed bg-zinc-900 border border-zinc-800 text-zinc-400 select-none ${className}`}
        aria-label="Party is full or expired - copying disabled"
      >
        <Lock className="w-3.5 h-3.5 text-zinc-400" />
        {showLabel && (
          <span>{isExpired ? "EXPIRED" : "PARTY FULL"}</span>
        )}
      </button>
    );
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      success("Party code copied!");

      if (partyId) {
        fetch(`/api/parties/${partyId}/copy`, { method: "POST" }).catch(() => {});
      }

      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to copy code to clipboard", err);
    }
  };

  const variantStyles = {
    primary:
      "bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm hover:shadow-val-glow active:scale-[0.98]",
    secondary:
      "bg-val-surfaceElevated hover:bg-val-border border border-val-borderLight text-val-white active:scale-[0.98]",
    subtle:
      "bg-transparent hover:bg-val-surfaceElevated text-val-muted hover:text-val-white border border-transparent hover:border-val-border",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy VALORANT Party Code"
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-md font-semibold text-xs tracking-wider uppercase transition-all duration-150 cursor-pointer ${variantStyles[variant]} ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-300 animate-in zoom-in-50 duration-200" />
          {showLabel && <span className="text-emerald-300">Copied</span>}
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          {showLabel && <span>Copy Code</span>}
        </>
      )}
    </button>
  );
}

