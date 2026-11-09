"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { LogIn, AlertCircle, ArrowRight, Shield } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/parties";

  const { login } = useAuth();
  const { success, error } = useToast();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim() || !password) {
      setErrorMessage("Please enter both username/email and password.");
      return;
    }

    setLoading(true);

    const result = await login({ identifier, password });
    if (!result.success) {
      setErrorMessage(result.error || "Login failed");
      error(result.error || "Login failed");
      setLoading(false);
    } else {
      success("Welcome back, Agent!");
      router.push(redirectUrl);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-val-surface border border-val-border p-6 sm:p-8 shadow-2xl">
      <div className="text-center mb-8">
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
        <h1 className="text-2xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
          Agent Sign In
        </h1>
        <p className="text-xs text-val-muted mt-1">
          Access your published parties and find squadmates
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-val-red/60 text-val-red text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1.5">
            Email or Username
          </label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. ViperQueen or viper@lastmate.gg"
            className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-val-dim">
              Password
            </label>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? "Authenticating..." : "Sign In"}</span>
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-val-muted">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/register"
          className="font-bold text-val-white hover:text-val-red transition-colors underline underline-offset-4"
        >
          Create an Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center relative">
      <div className="absolute inset-0 bg-val-mesh opacity-20 pointer-events-none" />
      <Suspense
        fallback={
          <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
