"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Wrench, ShieldAlert, Lock, ArrowRight } from "lucide-react";

export default function MaintenanceShield({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json();
          setMaintenanceMode(Boolean(data.maintenanceMode));
        }
      } catch {
        // fallback
      } finally {
        setChecking(false);
      }
    }
    checkMaintenance();
  }, [pathname]);

  // Always allow staff or login/admin routes
  const isStaff =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "MODERATOR";

  const isBypassPath =
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname?.startsWith("/api");

  if (!maintenanceMode || isStaff || isBypassPath || isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black text-val-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      {/* Background glow and tactical radar */}
      <div className="absolute inset-0 bg-val-mesh opacity-30 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-val-red/10 blur-[150px] pointer-events-none" />

      {/* Content Card */}
      <div className="relative max-w-lg w-full rounded-2xl bg-[#0F0F14] border border-[#2B2B36] p-8 shadow-2xl">
        {/* Tactical Corner Decals */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-val-red" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-val-red" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-val-red" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-val-red" />

        {/* Logo */}
        <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-val-border/90 mx-auto mb-6 shadow-[0_0_30px_rgba(255,70,85,0.3)] bg-black">
          <Image
            src="/logo.jpg"
            alt="LastMate Logo"
            fill
            sizes="144px"
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Maintenance Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Wrench className="w-3.5 h-3.5 animate-spin" />
          <span>Under Scheduled Maintenance</span>
        </div>

        <h1 className="text-3xl font-extrabold uppercase tracking-tight font-gaming text-val-white mb-3">
          Tactical Overhaul in Progress
        </h1>

        <p className="text-sm text-val-muted leading-relaxed mb-6">
          LastMate is temporarily undergoing maintenance and infrastructure upgrades to improve party code matchmaking. Normal operations will resume shortly.
        </p>

        <div className="p-3.5 rounded-xl bg-val-surface border border-val-border text-xs text-val-dim flex items-center justify-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>System Status: Code Deployment & Database Sync</span>
        </div>

        {/* Staff Access Link */}
        <div className="pt-4 border-t border-[#23232E] flex items-center justify-between text-xs">
          <span className="text-val-dim">Authorized Staff Member?</span>
          <Link
            href="/login?redirect=/admin"
            className="inline-flex items-center gap-1.5 text-val-red hover:text-val-redHover font-semibold transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Staff Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

