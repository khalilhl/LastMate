import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
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
            <Shield className="w-4 h-4" />
            Legal Agreement
          </span>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
            Terms of Service
          </h1>
          <p className="text-xs text-val-muted mt-1">Last updated: November 2026</p>
        </div>

        <div className="space-y-4 text-xs text-val-muted leading-relaxed">
          <h2 className="text-sm font-bold text-val-white uppercase tracking-wider">
            1. Nature of the Platform
          </h2>
          <p>
            LastMate is an independent community hub facilitating matchmaking by allowing players to share official in-game party codes generated within VALORANT. LastMate is not affiliated with, endorsed by, or partnered with Riot Games, Inc. VALORANT and all associated logos are trademarks of Riot Games.
          </p>

          <h2 className="text-sm font-bold text-val-white uppercase tracking-wider">
            2. In-Game Code Sharing & Community Safety
          </h2>
          <p>
            Users agree only to publish valid VALORANT party codes. Users must never share login credentials, passwords, or personal identifying information. Users engaging in hate speech, harassment, fake code spam, or abusive behavior will be permanently banned from LastMate.
          </p>

          <h2 className="text-sm font-bold text-val-white uppercase tracking-wider">
            3. Disclaimer of Warranties
          </h2>
          <p>
            LastMate provides this matchmaking tool on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We do not guarantee that third-party players you connect with in-game will behave respectfully or maintain any given rank. In-game interactions are governed by Riot Games&apos; Terms of Service and Code of Conduct.
          </p>
        </div>
      </div>
    </div>
  );
}

