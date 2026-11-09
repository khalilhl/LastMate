import React from "react";
import { getRankColor, getRankTier } from "@/lib/constants";

interface RankBadgeProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function RankTierIcon({ tier, className = "w-3.5 h-3.5" }: { tier: string; className?: string }) {
  const normalized = tier.toLowerCase();

  switch (normalized) {
    case "radiant":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" />
          <polygon points="12,6 13.5,10.5 18,12 13.5,13.5 12,18 10.5,13.5 6,12 10.5,10.5" fill="#FFFBEB" />
        </svg>
      );
    case "immortal":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,3 19,8 19,16 12,21 5,16 5,8" />
          <polygon points="12,6 16,12 12,18 8,12" fill="#FFE4E6" />
        </svg>
      );
    case "ascendant":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,3 20,11 17,21 7,21 4,11" />
          <polygon points="12,8 16,13 12,17 8,13" fill="#D1FAE5" />
        </svg>
      );
    case "diamond":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,2 21,12 12,22 3,12" />
          <polygon points="12,6 17,12 12,18 7,12" fill="#F3E8FF" />
        </svg>
      );
    case "platinum":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,2 17,7 17,17 12,22 7,17 7,7" />
          <circle cx="12" cy="12" r="3" fill="#ECFEFF" />
        </svg>
      );
    case "gold":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,3 21,9 18,21 6,21 3,9" />
          <polygon points="12,8 16,15 8,15" fill="#FEF3C7" />
        </svg>
      );
    case "silver":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,3 20,10 12,21 4,10" />
        </svg>
      );
    case "bronze":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="12,4 19,18 5,18" />
        </svg>
      );
    case "iron":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
          <polygon points="6,4 18,4 15,20 9,20" />
        </svg>
      );
  }
}

export default function RankBadge({ rank, size = "md", showIcon = true }: RankBadgeProps) {
  const colors = getRankColor(rank);
  const tier = getRankTier(rank);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-bold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-extrabold gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3 shrink-0",
    md: "w-3.5 h-3.5 shrink-0",
    lg: "w-4 h-4 shrink-0",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border tracking-wide uppercase transition-all duration-200 ${colors.bg} ${colors.border} ${colors.text} ${colors.glow} ${sizeClasses[size]}`}
    >
      {showIcon && <RankTierIcon tier={tier} className={iconSizes[size]} />}
      <span>{rank || "Unranked"}</span>
    </span>
  );
}
