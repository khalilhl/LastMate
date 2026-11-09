"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopNav from "@/components/admin/AdminTopNav";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/admin");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase font-mono tracking-widest text-val-muted">
            Verifying Clearance...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in (handled by redirect, fallback safety)
  if (!user) {
    return null;
  }

  // Role check: Only SUPER_ADMIN, ADMIN, or MODERATOR can access /admin
  const isAuthorizedStaff =
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "MODERATOR";

  if (!isAuthorizedStaff || user.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#15151C] border border-rose-900/60 p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/40 border border-val-red/40 flex items-center justify-center text-val-red mx-auto mb-4 shadow-val-glow-sm">
            <Lock className="w-7 h-7" />
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Access Restricted
          </span>
          <h2 className="text-2xl font-extrabold uppercase tracking-wide font-gaming text-val-white mt-3">
            Security Clearance Required
          </h2>
          <p className="text-xs text-val-muted mt-2 mb-6 leading-relaxed">
            Your account (<span className="text-val-white font-semibold">{user.username}</span>) does not possess administrator credentials. This incident has been logged.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-val-white flex">
      {/* Sidebar */}
      <AdminSidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav onOpenMobile={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

