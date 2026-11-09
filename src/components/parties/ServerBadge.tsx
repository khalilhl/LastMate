import React from "react";
import { Globe } from "lucide-react";

interface ServerBadgeProps {
  server: string;
  size?: "sm" | "md";
}

export default function ServerBadge({ server, size = "md" }: ServerBadgeProps) {
  // Shorten server label if too long for card display (e.g. "Frankfurt (EU Central)" -> "Frankfurt")
  const shortServer = server ? server.split(" ")[0] : "Frankfurt";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium bg-val-surfaceElevated/80 border border-val-border text-val-muted rounded-md ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
      title={server}
    >
      <Globe className="w-3.5 h-3.5 text-val-muted/80" />
      <span className="text-val-white">{shortServer}</span>
    </span>
  );
}

