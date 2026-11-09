"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RankBadge from "@/components/parties/RankBadge";
import {
  Gamepad2,
  PlusCircle,
  Search,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Shield,
  Layers,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-val-border/80 bg-val-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-val-border/90 group-hover:border-val-red/80 transition-all shadow-val-glow-sm bg-val-surface shrink-0">
              <Image
                src="/logo.jpg"
                alt="LastMate Logo"
                fill
                sizes="44px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-wider text-val-white group-hover:text-val-red transition-colors uppercase font-gaming leading-tight">
                LAST<span className="text-val-red">MATE</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-val-dim font-mono">
                VALORANT Squad Finder
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              href="/parties"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold transition-all ${
                isActive("/parties")
                  ? "bg-val-surfaceElevated text-val-white border border-val-borderLight"
                  : "text-val-muted hover:text-val-white hover:bg-val-surface"
              }`}
            >
              <Search className="w-4 h-4 text-val-red" />
              <span>Find a Party</span>
            </Link>

            <Link
              href="/parties/create"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold transition-all ${
                isActive("/parties/create")
                  ? "bg-val-red text-white shadow-val-glow-sm"
                  : "text-val-muted hover:text-val-white hover:bg-val-surface"
              }`}
            >
              <PlusCircle className="w-4 h-4 text-val-red" />
              <span>Post Your Party</span>
            </Link>

            <Link
              href="/#how-it-works"
              className="px-3.5 py-2 rounded-md text-sm font-semibold text-val-muted hover:text-val-white hover:bg-val-surface transition-all"
            >
              How It Works
            </Link>
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-8 bg-val-surface animate-pulse rounded-md" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-3 rounded-lg border border-val-border bg-val-surface hover:bg-val-surfaceHover transition-colors"
                >
                  <div className="text-right">
                    <span className="text-xs font-bold text-val-white block">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-val-muted block">
                      {user.riotId || user.mainRole}
                    </span>
                  </div>
                  <RankBadge rank={user.rank} size="sm" showIcon={false} />
                  <div className="w-7 h-7 rounded-md bg-val-surfaceElevated border border-val-border flex items-center justify-center text-val-red font-bold text-xs uppercase">
                    {user.username.charAt(0)}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-val-surface border border-val-border shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-val-border/60">
                      <p className="text-xs text-val-dim">Signed in as</p>
                      <p className="text-sm font-bold text-val-white truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-val-muted hover:text-val-white hover:bg-val-surfaceHover transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-val-red" />
                      <span>My Profile & Parties</span>
                    </Link>

                    <Link
                      href="/parties/create"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-val-muted hover:text-val-white hover:bg-val-surfaceHover transition-colors"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-400" />
                      <span>Create New Party</span>
                    </Link>

                    {(user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MODERATOR") && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/20 hover:bg-amber-950/40 border-t border-b border-amber-900/40 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <div className="my-1 border-t border-val-border/60" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-val-white hover:bg-val-surface transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm hover:shadow-val-glow transition-all active:scale-[0.98]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-val-muted hover:text-val-white hover:bg-val-surface border border-val-border"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-val-border bg-val-surface/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/parties"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-val-white hover:bg-val-surfaceElevated"
          >
            <Search className="w-4 h-4 text-val-red" />
            <span>Find a Party</span>
          </Link>

          <Link
            href="/parties/create"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-val-white hover:bg-val-surfaceElevated"
          >
            <PlusCircle className="w-4 h-4 text-val-red" />
            <span>Post Your Party</span>
          </Link>

          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-val-muted hover:text-val-white"
          >
            <Layers className="w-4 h-4" />
            <span>How It Works</span>
          </Link>

          <div className="pt-3 border-t border-val-border/60">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-val-white">{user.username}</p>
                    <p className="text-[10px] text-val-muted">{user.email}</p>
                  </div>
                  <RankBadge rank={user.rank} size="sm" />
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-val-white hover:bg-val-surfaceElevated"
                >
                  <UserIcon className="w-4 h-4 text-val-red" />
                  <span>Profile & Announcements</span>
                </Link>
                {(user.role === "SUPER_ADMIN" || user.role === "ADMIN" || user.role === "MODERATOR") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-amber-300 bg-amber-950/30 border border-amber-500/40"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-950/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-val-white border border-val-border hover:bg-val-surfaceElevated"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

