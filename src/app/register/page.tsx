"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  VALORANT_RANKS,
  VALORANT_ROLES,
  VALORANT_SERVERS,
} from "@/lib/constants";
import { UserPlus, AlertCircle, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    riotId: "",
    rank: "Gold 1",
    mainRole: "Duelist",
    preferredServer: "Frankfurt (EU Central)",
  });

  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.username.trim() || formData.username.length < 3) {
      setFormError("Username must be at least 3 characters.");
      return;
    }

    if (!formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const result = await register({
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      riotId: formData.riotId.trim() || undefined,
      rank: formData.rank,
      mainRole: formData.mainRole,
      preferredServer: formData.preferredServer,
    });

    if (!result.success) {
      setFormError(result.error || "Failed to create account.");
      error(result.error || "Failed to create account.");
      setLoading(false);
    } else {
      success("Welcome to LastMate! Your account is ready.");
      router.push("/parties");
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-val-mesh opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-lg rounded-2xl bg-val-surface border border-val-border p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="relative w-36 h-24 rounded-xl overflow-hidden border border-val-border/90 mx-auto mb-4 shadow-[0_0_25px_rgba(255,70,85,0.25)] bg-black">
            <Image
              src="/logo.jpg"
              alt="LastMate Logo"
              fill
              sizes="144px"
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-val-red/10 border border-val-red/30 text-val-red text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Join the Community</span>
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
            Create Agent Profile
          </h1>
          <p className="text-xs text-val-muted mt-1">
            Publish party codes and find teammates matching your rank
          </p>
        </div>

        {formError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-val-red/60 text-val-red text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Username <span className="text-val-red">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. PhoenixMain"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Riot ID (Optional)
              </label>
              <input
                type="text"
                value={formData.riotId}
                onChange={(e) => setFormData({ ...formData, riotId: e.target.value })}
                placeholder="e.g. Phoenix#EUW"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
              Email Address <span className="text-val-red">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="agent@example.com"
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Password <span className="text-val-red">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Confirm Password <span className="text-val-red">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Repeat password"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Current Rank
              </label>
              <select
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_RANKS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Main Role
              </label>
              <select
                value={formData.mainRole}
                onChange={(e) => setFormData({ ...formData, mainRole: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Preferred Server
              </label>
              <select
                value={formData.preferredServer}
                onChange={(e) => setFormData({ ...formData, preferredServer: e.target.value })}
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-val-red"
              >
                {VALORANT_SERVERS.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-val-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-val-white hover:text-val-red transition-colors underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

