"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PartySummary, PlatformStats } from "@/lib/types";
import PartyCard from "@/components/parties/PartyCard";
import {
  Search,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Copy,
  Gamepad2,
  CheckCircle2,
  Trophy,
  Flame,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [featuredParties, setFeaturedParties] = useState<PartySummary[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    activeParties: 16,
    playersSearching: 64,
    partiesCompleted: 142,
    totalPartiesCreated: 310,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [partiesRes, statsRes] = await Promise.all([
          fetch("/api/parties?limit=6&sortBy=newest"),
          fetch("/api/parties/stats"),
        ]);

        if (partiesRes.ok) {
          const pData = await partiesRes.json();
          setFeaturedParties(pData.parties || []);
        }

        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData);
        }
      } catch (err) {
        console.error("Home page load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/parties?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      router.push("/parties");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-val-border/60 bg-gradient-to-b from-[#0B0E14] via-[#0E141D] to-[#0B0E14]">
        {/* Glow & Grid Effects */}
        <div className="absolute inset-0 bg-val-mesh opacity-40 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-val-red/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-val-red/40 bg-val-surface/80 text-val-red text-xs font-bold uppercase tracking-widest shadow-val-glow-sm mb-6">
            <Flame className="w-3.5 h-3.5 animate-pulse text-val-red" />
            <span>VALORANT Party Code Matchmaking</span>
          </div>

          {/* Hero Official Artwork / Logo Showcase */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md md:max-w-lg mb-8 group">
            {/* Ambient Aura */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-val-red/30 via-val-red/60 to-val-red/30 rounded-2xl blur-xl opacity-60 group-hover:opacity-90 transition duration-700 pointer-events-none" />
            
            <div className="relative rounded-2xl overflow-hidden border border-val-border/90 shadow-[0_0_50px_rgba(255,70,85,0.3)] bg-black">
              {/* Tactical Corner Decals */}
              <div className="absolute top-2 left-2 z-10 w-2.5 h-2.5 border-t-2 border-l-2 border-val-red/80 pointer-events-none" />
              <div className="absolute top-2 right-2 z-10 w-2.5 h-2.5 border-t-2 border-r-2 border-val-red/80 pointer-events-none" />
              <div className="absolute bottom-2 left-2 z-10 w-2.5 h-2.5 border-b-2 border-l-2 border-val-red/80 pointer-events-none" />
              <div className="absolute bottom-2 right-2 z-10 w-2.5 h-2.5 border-b-2 border-r-2 border-val-red/80 pointer-events-none" />

              <Image
                src="/logo.jpg"
                alt="LastMate - Find Your Last. Win Together."
                width={1000}
                height={667}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tight font-gaming text-val-white max-w-4xl mx-auto leading-[1.05]">
            Find Your <span className="text-val-red underline decoration-val-red/40 underline-offset-8">Last</span>.{" "}
            <br />
            Win Together.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-val-muted max-w-2xl mx-auto leading-relaxed">
            Looking for one more teammate? Discover VALORANT parties, grab their official party code, and complete your squad in seconds.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-xl bg-val-surface/90 border border-val-border shadow-2xl backdrop-blur-md"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-val-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by rank (e.g. Ascendant), server (Frankfurt), or code..."
                className="w-full bg-transparent text-sm text-val-white placeholder:text-val-dim pl-11 pr-4 py-3 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Search Lobbies</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* CTA Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/parties"
              className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow transition-all flex items-center gap-2 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Find a Party</span>
            </Link>

            <Link
              href="/parties/create"
              className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-surfaceElevated hover:bg-val-surface border border-val-borderLight text-val-white transition-all flex items-center gap-2 active:scale-95"
            >
              <Zap className="w-4 h-4 text-val-red" />
              <span>Post Your Party</span>
            </Link>
          </div>

          {/* Quick Disclaimer */}
          <p className="mt-4 text-[11px] text-val-dim">
            Official party codes are generated inside VALORANT. LastMate does not access your game files or account.
          </p>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="border-b border-val-border bg-val-surface/40 py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-val-surface/70 border border-val-border">
              <div className="text-2xl sm:text-3xl font-extrabold text-val-red font-mono">
                {stats.activeParties}
              </div>
              <div className="text-xs uppercase font-bold text-val-muted tracking-wider mt-1">
                Active Parties
              </div>
            </div>

            <div className="p-4 rounded-xl bg-val-surface/70 border border-val-border">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                {stats.playersSearching}
              </div>
              <div className="text-xs uppercase font-bold text-val-muted tracking-wider mt-1">
                Players Queued
              </div>
            </div>

            <div className="p-4 rounded-xl bg-val-surface/70 border border-val-border">
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
                {stats.partiesCompleted}+
              </div>
              <div className="text-xs uppercase font-bold text-val-muted tracking-wider mt-1">
                Squads Completed
              </div>
            </div>

            <div className="p-4 rounded-xl bg-val-surface/70 border border-val-border">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
                &lt; 45s
              </div>
              <div className="text-xs uppercase font-bold text-val-muted tracking-wider mt-1">
                Avg. Fill Time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED AVAILABLE PARTIES */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-val-red text-xs font-bold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Listings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
              Featured Available Parties
            </h2>
            <p className="text-xs text-val-muted mt-1">
              Currently open squads waiting for their final teammate. Grab their code to join.
            </p>
          </div>

          <Link
            href="/parties"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-val-red hover:text-val-redHover transition-colors shrink-0"
          >
            <span>View All Parties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-xl border border-val-border bg-val-surface animate-pulse"
              />
            ))}
          </div>
        ) : featuredParties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredParties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-val-border rounded-xl bg-val-surface p-8">
            <Users className="w-10 h-10 text-val-muted mx-auto mb-3" />
            <h3 className="text-base font-bold text-val-white">No active parties right now</h3>
            <p className="text-xs text-val-muted mt-1 mb-4">
              Be the first squad leader to post your party code!
            </p>
            <Link
              href="/parties/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red text-white shadow-val-glow-sm"
            >
              Post Your Party
            </Link>
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section
        id="how-it-works"
        className="py-20 border-t border-b border-val-border bg-gradient-to-b from-[#0E141D] to-[#0B0E14] relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-val-red">
              Simple & Fast
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wide font-gaming text-val-white mt-1">
              How LastMate Works
            </h2>
            <p className="text-xs sm:text-sm text-val-muted mt-2">
              Three simple steps to assemble a full 5-stack without adding friends or joining external Discord servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="relative p-6 rounded-xl bg-val-surface border border-val-border hover:border-val-borderLight transition-all">
              <div className="w-12 h-12 rounded-lg bg-val-surfaceElevated border border-val-border flex items-center justify-center font-gaming text-xl font-bold text-val-red mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-val-white mb-2">
                Generate In-Game Code
              </h3>
              <p className="text-xs text-val-muted leading-relaxed">
                Form your party inside VALORANT with your friends, open party privacy settings, and generate your official Riot party code.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 rounded-xl bg-val-surface border border-val-border hover:border-val-borderLight transition-all">
              <div className="w-12 h-12 rounded-lg bg-val-surfaceElevated border border-val-border flex items-center justify-center font-gaming text-xl font-bold text-val-red mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-val-white mb-2">
                Publish on LastMate
              </h3>
              <p className="text-xs text-val-muted leading-relaxed">
                Post your party with your average rank, server region, voice requirements, and role needed (e.g. Smokes / Controller).
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 rounded-xl bg-val-surface border border-val-border hover:border-val-borderLight transition-all">
              <div className="w-12 h-12 rounded-lg bg-val-surfaceElevated border border-val-border flex items-center justify-center font-gaming text-xl font-bold text-val-red mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-val-white mb-2">
                Copy Code & Join Game
              </h3>
              <p className="text-xs text-val-muted leading-relaxed">
                Players browse available squads, hit &ldquo;Copy Code&rdquo;, paste it in VALORANT&apos;s &ldquo;Join Party with Code&rdquo; box, and queue up!
              </p>
            </div>
          </div>

          {/* Bottom callout */}
          <div className="mt-14 p-6 rounded-xl bg-val-surfaceElevated/60 border border-val-border text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-bold text-val-white">Ready to complete your party?</h4>
              <p className="text-xs text-val-muted">Publish your party code now. It takes less than 30 seconds.</p>
            </div>
            <Link
              href="/parties/create"
              className="px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm transition-all shrink-0"
            >
              Post Your Party Code
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

