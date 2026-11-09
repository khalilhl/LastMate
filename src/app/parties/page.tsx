"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PartySummary, FilterState } from "@/lib/types";
import PartyCard from "@/components/parties/PartyCard";
import PartyFilters from "@/components/parties/PartyFilters";
import { Users, PlusCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function FindPartyContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const initialRank = searchParams.get("rank") || "";
  const initialRole = searchParams.get("role") || "";

  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch,
    rank: initialRank,
    server: "",
    role: initialRole,
    language: "",
    voiceChat: "all",
    availableSlots: "all",
    sortBy: "newest",
  });

  const [parties, setParties] = useState<PartySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchParties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.rank) params.set("rank", filters.rank);
      if (filters.server) params.set("server", filters.server);
      if (filters.role) params.set("role", filters.role);
      if (filters.language) params.set("language", filters.language);
      if (filters.voiceChat !== "all") params.set("voiceChat", filters.voiceChat);
      if (filters.availableSlots !== "all") params.set("availableSlots", filters.availableSlots);
      if (filters.partyType && filters.partyType !== "all") params.set("partyType", filters.partyType);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      params.set("page", page.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/parties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setParties(data.parties || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching parties:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchParties();
  }, [fetchParties]);

  const handleResetFilters = () => {
    setFilters({
      search: "",
      rank: "",
      server: "",
      role: "",
      language: "",
      voiceChat: "all",
      availableSlots: "all",
      sortBy: "newest",
    });
    setPage(1);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
            Available Squads & Parties
          </h1>
          <p className="text-xs sm:text-sm text-val-muted mt-1">
            Browse published VALORANT party codes. Grab a code and join immediately inside the game client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchParties()}
            className="p-2.5 rounded-lg border border-val-border text-val-muted hover:text-val-white hover:bg-val-surface transition-colors"
            title="Refresh party listings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-val-red" : ""}`} />
          </button>

          <Link
            href="/parties/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Party</span>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="mb-8">
        <PartyFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Result Count Status */}
      <div className="flex items-center justify-between text-xs text-val-muted mb-4 px-1">
        <span>
          Showing <span className="font-semibold text-val-white">{parties.length}</span> of{" "}
          <span className="font-semibold text-val-white">{totalCount}</span> available parties
        </span>
        {filters.rank && (
          <span className="text-val-dim">Filtered by rank: {filters.rank}</span>
        )}
      </div>

      {/* Parties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-xl border border-val-border bg-val-surface animate-pulse"
            />
          ))}
        </div>
      ) : parties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.map((party) => (
            <PartyCard key={party.id} party={party} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-val-border rounded-xl bg-val-surface p-8 max-w-xl mx-auto">
          <Users className="w-12 h-12 text-val-dim mx-auto mb-3" />
          <h3 className="text-lg font-bold text-val-white">No parties matched your filters</h3>
          <p className="text-xs text-val-muted mt-1 mb-5">
            Try adjusting your rank tier, server, or role filters, or publish your own squad code.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-surfaceElevated border border-val-border text-val-white hover:bg-val-border"
            >
              Reset Filters
            </button>
            <Link
              href="/parties/create"
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red text-white shadow-val-glow-sm"
            >
              Post a Party
            </Link>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12 pt-6 border-t border-val-border">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-val-border bg-val-surface text-xs font-bold text-val-white disabled:opacity-40 hover:bg-val-surfaceElevated transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="text-xs text-val-muted font-medium px-2">
            Page <span className="text-val-white font-bold">{page}</span> of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-val-border bg-val-surface text-xs font-bold text-val-white disabled:opacity-40 hover:bg-val-surfaceElevated transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FindPartyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-val-red border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <FindPartyContent />
    </Suspense>
  );
}
