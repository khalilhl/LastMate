import React from "react";
import { Crosshair, Compass, Cloud, Shield, Users } from "lucide-react";

interface RoleBadgeProps {
  role: string;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const getRoleIcon = () => {
    switch (role?.toLowerCase()) {
      case "duelist":
        return <Crosshair className={size === "sm" ? "w-3 h-3 text-rose-400" : "w-3.5 h-3.5 text-rose-400"} />;
      case "initiator":
        return <Compass className={size === "sm" ? "w-3 h-3 text-cyan-400" : "w-3.5 h-3.5 text-cyan-400"} />;
      case "controller":
        return <Cloud className={size === "sm" ? "w-3 h-3 text-amber-400" : "w-3.5 h-3.5 text-amber-400"} />;
      case "sentinel":
        return <Shield className={size === "sm" ? "w-3 h-3 text-emerald-400" : "w-3.5 h-3.5 text-emerald-400"} />;
      default:
        return <Users className={size === "sm" ? "w-3 h-3 text-val-muted" : "w-3.5 h-3.5 text-val-muted"} />;
    }
  };

  const getRoleColor = () => {
    switch (role?.toLowerCase()) {
      case "duelist":
        return "bg-rose-950/30 text-rose-300 border-rose-800/40";
      case "initiator":
        return "bg-cyan-950/30 text-cyan-300 border-cyan-800/40";
      case "controller":
        return "bg-amber-950/30 text-amber-300 border-amber-800/40";
      case "sentinel":
        return "bg-emerald-950/30 text-emerald-300 border-emerald-800/40";
      default:
        return "bg-zinc-800/40 text-zinc-300 border-zinc-700/50";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-md ${getRoleColor()} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
    >
      {getRoleIcon()}
      <span>{role || "Any"}</span>
    </span>
  );
}

