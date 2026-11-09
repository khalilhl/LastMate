import React from "react";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-val-muted hover:text-val-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="rounded-2xl border border-val-border bg-val-surface p-6 sm:p-10 shadow-2xl space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-val-red flex items-center gap-1.5 mb-2">
            <Lock className="w-4 h-4" />
            Data Protection
          </span>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
            Privacy Policy
          </h1>
          <p className="text-xs text-val-muted mt-1">Last updated: November 2026</p>
        </div>

        <div className="space-y-4 text-xs text-val-muted leading-relaxed">
          <h2 className="text-sm font-bold text-val-white uppercase tracking-wider">
            1. Information We Collect
          </h2>
          <p>
            We collect the basic account details you provide: your chosen username, email address, password hash (securely encrypted using bcrypt), and optional game preferences (such as your Riot ID and rank). We never ask for or store your Riot Games account password or payment information.
          </p>

          <h2 className="text-sm font-bold text-val-white uppercase tracking-wider">
            2. Cookies & Session Management
          </h2>
          <p>
            We use secure HTTP-only cookies solely for user authentication and session management. We do not use third-party tracking or advertising cookies.
          </p>

          <h2 className="text-sm font-bold text-val-white uppercase tracking-wider">
            3. Data Retention
          </h2>
          <p>
            You may update or delete your published party announcements at any time through your Profile dashboard. Closed or expired parties are automatically pruned from active public listings.
          </p>
        </div>
      </div>
    </div>
  );
}

