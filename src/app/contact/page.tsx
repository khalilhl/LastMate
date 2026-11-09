"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-val-muted hover:text-val-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="rounded-2xl border border-val-border bg-val-surface p-6 sm:p-10 shadow-2xl">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-val-red flex items-center gap-1.5 mb-2">
            <Mail className="w-4 h-4" />
            Support & Inquiries
          </span>
          <h1 className="text-3xl font-extrabold uppercase tracking-wide font-gaming text-val-white">
            Contact LastMate Team
          </h1>
          <p className="text-xs text-val-muted mt-1">
            Have feedback, bug reports, or feature ideas? Send us a transmission.
          </p>
        </div>

        {sent ? (
          <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-val-white">Transmission Dispatched!</h3>
            <p className="text-xs text-val-muted">
              Thanks for reaching out! Our team will review your message shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Your Name / Call-Sign
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Agent Name"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="agent@domain.com"
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-val-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-val-dim mb-1">
                Message / Feedback
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Describe what you want to report, ask, or request..."
                className="w-full bg-val-surfaceElevated border border-val-border text-val-white text-xs rounded-lg p-3.5 focus:outline-none focus:border-val-red"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg text-xs font-bold uppercase tracking-wider bg-val-red hover:bg-val-redHover text-white shadow-val-glow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

