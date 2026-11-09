"use client";

import React, { useState } from "react";
import { FilterState } from "@/lib/types";
import {
  VALORANT_RANK_TIERS,
  VALORANT_SERVERS,
  VALORANT_ROLES,
  LANGUAGES,
} from "@/lib/constants";
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PartyFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
}

export default function PartyFilters({ filters, onChange, onReset }: PartyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (key: keyof FilterState, val: string) => {
    onChange({
      ...filters,
      [key]: val,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.rank ||
    filters.server ||
    filters.role ||
    filters.language ||
    filters.voiceChat !== "all" ||
    filters.availableSlots !== "all" ||
    filters.sortBy !== "newest";

  return (
    <div className="rounded-xl border border-val-border bg-val-surface p-4 sm:p-5 shadow-lg space-y-4">
      {/* Top Bar: Search input + Quick Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-val-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update("search", e.target.value)}
            placeholder="Search party code, squad name, server, or description..."
            className="w-full bg-val-surfaceElevated border border-val-border text-val-white placeholder:text-val-dim text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-val-red focus:ring-1 focus:ring-val-red transition-all"
          />
          {filters.search && (
            <button
              onClick={() => update("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-val-muted hover:text-val-white bg-val-surface px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick controls: Sort By & Toggle Advanced */}
        <div className="flex items-center gap-2">
          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-val-surfaceElevated border border-val-border rounded-lg px-3 py-2">
            <span className="text-xs text-val-muted whitespace-nowrap">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => update("sortBy", e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-val-white focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-val-surface">Newest</option>
              <option value="rank_desc" className="bg-val-surface">Highest Rank</option>
              <option value="updated" className="bg-val-surface">Recently Updated</option>
            </select>
          </div>

          {/* Toggle Advanced */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
              showAdvanced || hasActiveFilters
                ? "bg-val-surfaceElevated border-val-red/60 text-val-white"
                : "border-val-border text-val-muted hover:text-val-white hover:bg-val-surfaceElevated"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-val-red" />
            <span>Filters</span>
            {showAdvanced ? (
              <ChevronUp className="w-3.5 h-3.5 ml-1" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            )}
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-lg border border-val-border text-val-muted hover:text-val-white hover:border-val-red/50 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Role Pill Selector (Always visible for quick gaming filter) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <span className="text-[11px] font-bold text-val-muted uppercase tracking-wider mr-1 shrink-0">
          Role:
        </span>
        {["all", ...VALORANT_ROLES].map((role) => {
          const isSelected = (!filters.role && role === "all") || filters.role === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => update("role", role === "all" ? "" : role)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 capitalize ${
                isSelected
                  ? "bg-val-red text-white shadow-val-glow-sm"
                  : "bg-val-surfaceElevated text-val-muted hover:text-val-white hover:bg-val-border/60"
              }`}
            >
              {role === "all" ? "Any Role" : role}
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="pt-4 border-t border-val-border/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 animate-in fade-in duration-200">
          {/* Squad Type (Real vs Demo) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Squad Type
            </label>
            <select
              value={filters.partyType || "all"}
              onChange={(e) => update("partyType", e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
            >
              <option value="all">All Squads (Real & Demo)</option>
              <option value="REAL">Real User Squads Only</option>
              <option value="DEMO">Demo 5/5 Squads Only</option>
            </select>
          </div>

          {/* Rank Tier */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Rank Tier
            </label>
            <select
              value={filters.rank}
              onChange={(e) => update("rank", e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
            >
              <option value="">All Ranks</option>
              {VALORANT_RANK_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>

          {/* Server */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Server Region
            </label>
            <select
              value={filters.server}
              onChange={(e) => update("server", e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
            >
              <option value="">All Servers</option>
              {VALORANT_SERVERS.map((server) => (
                <option key={server} value={server}>
                  {server}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) => update("language", e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Voice Chat */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Voice Chat
            </label>
            <select
              value={filters.voiceChat}
              onChange={(e) => update("voiceChat", e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
            >
              <option value="all">Any Mic Preference</option>
              <option value="required">Mic Required Only</option>
              <option value="optional">No Mic Required</option>
            </select>
          </div>

          {/* Available Slots */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-val-dim mb-1.5">
              Slots Open
            </label>
            <select
              value={filters.availableSlots}
              onChange={(e) => update("availableSlots", e.target.value)}
              className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-val-red"
            >
              <option value="all">All Available Slots</option>
              <option value="1">Need 1 player (4/5)</option>
              <option value="2">Need 2 players (3/5)</option>
              <option value="3+">Need 3+ players</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

