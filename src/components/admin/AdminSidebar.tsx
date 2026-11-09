"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  AlertTriangle,
  Megaphone,
  BarChart3,
  ShieldCheck,
  History,
  Settings,
  ArrowLeft,
  X,
  Lock,
  Bot,
} from "lucide-react";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Parties", href: "/admin/parties", icon: Gamepad2 },
    { label: "Reports", href: "/admin/reports", icon: AlertTriangle },
    { label: "Content Management", href: "/admin/content", icon: Megaphone },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    {
      label: "Admin Management",
      href: "/admin/admins",
      icon: ShieldCheck,
      superOnly: true,
    },
    {
      label: "Demo & Expiration",
      href: "/admin/demo",
      icon: Bot,
      superOnly: true,
    },
    { label: "Activity Logs", href: "/admin/logs", icon: History },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "ADMIN":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MODERATOR":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#0B0B0F] border-r border-[#23232E] text-val-muted">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#23232E] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-val-border shadow-val-glow-sm bg-[#15151C] shrink-0">
            <Image
              src="/logo.jpg"
              alt="LastMate"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-gaming text-base font-extrabold uppercase tracking-wider text-val-white">
                LAST<span className="text-val-red">MATE</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-val-red text-white">
                ADMIN
              </span>
            </div>
            <p className="text-[10px] text-val-dim font-mono tracking-wider">
              COMMAND CENTER
            </p>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="md:hidden text-val-muted hover:text-val-white p-1"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-val-dim">
          Administration
        </div>
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const locked = item.superOnly && !isSuperAdmin;

          if (locked) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-val-dim/60 cursor-not-allowed"
                title="Super Admin Only"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-val-dim/40" />
                  <span>{item.label}</span>
                </div>
                <Lock className="w-3 h-3 text-val-dim/40" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                active
                  ? "bg-[#15151C] text-val-white border border-val-red/50 shadow-[0_0_15px_rgba(255,70,85,0.15)]"
                  : "text-val-muted hover:text-val-white hover:bg-[#15151C]/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    active ? "text-val-red" : "text-val-muted"
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-val-red animate-pulse" />}
            </Link>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-val-dim">
          Shortcuts
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-val-muted hover:text-val-white hover:bg-[#15151C]/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-val-muted" />
          <span>Back to Main Website</span>
        </Link>
      </div>

      {/* Admin User Footer Card */}
      {user && (
        <div className="p-4 border-t border-[#23232E] bg-[#121218]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0">
              <span className="text-xs font-bold text-val-white block truncate">
                {user.username}
              </span>
              <span className="text-[10px] text-val-dim block truncate font-mono">
                {user.email}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getRoleBadgeColor(
                user.role
              )}`}
            >
              {user.role}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-72 h-full z-10 animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

