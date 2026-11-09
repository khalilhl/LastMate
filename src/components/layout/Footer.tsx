"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShieldCheck, Sparkles, Heart } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Do not render public footer inside the admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-val-border bg-val-surface/90 text-val-muted text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="relative w-[54px] h-[36px] rounded-lg overflow-hidden border border-val-border shadow-val-glow-sm bg-black shrink-0">
                <Image
                  src="/logo.jpg"
                  alt="LastMate Logo"
                  fill
                  sizes="54px"
                  className="object-cover object-center"
                />
              </div>
              <span className="font-gaming text-lg tracking-wider font-extrabold text-val-white uppercase">
                LAST<span className="text-val-red">MATE</span>
              </span>
            </div>
            <p className="text-xs text-val-muted leading-relaxed">
              The premier VALORANT party-code sharing platform. Find your missing 5th player in seconds and jump straight into the fight.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-bold text-val-white text-xs uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/parties" className="hover:text-val-white transition-colors">
                  Find a Party
                </Link>
              </li>
              <li>
                <Link href="/parties/create" className="hover:text-val-white transition-colors">
                  Publish Party Code
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-val-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-val-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Competitive Links */}
          <div>
            <h4 className="font-bold text-val-white text-xs uppercase tracking-wider mb-3">
              Ranks & Lobbies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/parties?rank=Ascendant" className="hover:text-val-white transition-colors">
                  Ascendant & Immortal Lobbies
                </Link>
              </li>
              <li>
                <Link href="/parties?rank=Diamond" className="hover:text-val-white transition-colors">
                  Diamond Lobbies
                </Link>
              </li>
              <li>
                <Link href="/parties?rank=Platinum" className="hover:text-val-white transition-colors">
                  Platinum & Gold Lobbies
                </Link>
              </li>
              <li>
                <Link href="/parties?role=Controller" className="hover:text-val-white transition-colors">
                  Controller Needed Lobbies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Notice */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-val-white text-xs uppercase tracking-wider mb-3">
              Community & Safety
            </h4>
            <p className="text-val-dim leading-relaxed">
              Never share your account passwords or personal credentials. Official VALORANT party codes only allow players to join your in-game squad lobby.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 text-val-dim">
              <Link href="/terms" className="hover:text-val-muted underline underline-offset-2">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-val-muted underline underline-offset-2">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-val-muted underline underline-offset-2">
                Contact & Support
              </Link>
            </div>
          </div>
        </div>

        {/* Riot Games Disclaimer */}
        <div className="pt-8 border-t border-val-border/60 text-[11px] text-val-dim leading-relaxed flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="max-w-3xl text-center md:text-left">
            LastMate isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
          </p>
          <div className="shrink-0 flex items-center gap-1 text-val-muted font-medium">
            <span>Built for the VALORANT community</span>
            <Heart className="w-3.5 h-3.5 text-val-red inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}

