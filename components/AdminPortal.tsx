"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  Mail,
  Phone,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  Globe,
  Bot,
  Database,
  Search,
  X,
  RefreshCw,
  Lock,
  LogOut,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface Enquiry {
  id: string;
  objective: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  status: "new" | "read" | "replied";
  created_at: string;
}

const CORRECT_PIN = "2129";

export default function AdminPortal() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Enquiries state
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Filters & Search
  const [filterObjective, setFilterObjective] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // Check session authentication state
    const authSession = sessionStorage.getItem("admin_authenticated");
    const authLocal = localStorage.getItem("admin_authenticated");
    if (authSession === "true" || authLocal === "true") {
      setIsAuthenticated(true);
      fetchEnquiries();
    }
  }, []);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.trim() === CORRECT_PIN) {
      sessionStorage.setItem("admin_authenticated", "true");
      localStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
      setPinError(null);
      fetchEnquiries();
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    setPin("");
    setPinError(null);
  };

  const fetchEnquiries = async () => {
    setLoadingData(true);
    try {
      const list: Enquiry[] = [];

      // 1. Fetch from server API endpoint (combines server file + Supabase)
      try {
        const res = await fetch("/api/enquiries");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.enquiries)) {
            list.push(...json.enquiries);
          }
        }
      } catch (e) {
        console.warn("API enquiries fetch warning:", e);
      }

      // 2. Read from browser localStorage backup
      try {
        const localRaw = localStorage.getItem("jil_local_enquiries");
        if (localRaw) {
          const localParsed = JSON.parse(localRaw);
          if (Array.isArray(localParsed)) {
            list.push(...localParsed);
          }
        }
      } catch (e) {
        console.warn("LocalStorage enquiries fetch warning:", e);
      }

      // 3. Direct Supabase query fallback
      try {
        const { data, error } = await supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          list.push(...(data as Enquiry[]));
        }
      } catch (e) {
        console.warn("Direct Supabase fetch warning:", e);
      }

      // Deduplicate by ID or email + created_at
      const map = new Map<string, Enquiry>();
      list.forEach((item) => {
        const key = item.id || `${item.email}-${item.created_at}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
      });

      const deduplicated = Array.from(map.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setEnquiries(deduplicated);
    } catch (err) {
      console.error("Fetch enquiries exception:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "new" | "read" | "replied") => {
    // Immediate UI state update
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
    }

    // Update in localStorage
    try {
      const localRaw = localStorage.getItem("jil_local_enquiries");
      if (localRaw) {
        const localParsed = JSON.parse(localRaw) as Enquiry[];
        const updated = localParsed.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        );
        localStorage.setItem("jil_local_enquiries", JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("LocalStorage status update error:", e);
    }

    // Update via API endpoint
    try {
      await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      console.warn("API status update error:", e);
    }

    // Direct Supabase update
    try {
      await supabase.from("enquiries").update({ status: newStatus }).eq("id", id);
    } catch (e) {
      console.warn("Supabase status update error:", e);
    }
  };

  // Filter calculations
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesObjective = filterObjective === "All" || item.objective === filterObjective;
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === "" ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.mobile && item.mobile.includes(searchQuery)) ||
      (item.message && item.message.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesObjective && matchesStatus && matchesSearch;
  });

  const unreadCount = enquiries.filter((item) => item.status === "new").length;

  // ---------------------------------------------------------------------------
  // 1. PIN GUARD LOGIN SCREEN (Luxury Dark Theme matching Website Aesthetic)
  // ---------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-5 sm:p-8 relative overflow-hidden font-sans selection:bg-white/20 selection:text-white">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Main Glass Card */}
        <div className="w-full max-w-[440px] glass-panel rounded-3xl p-7 sm:p-10 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] relative z-10">
          {/* Header Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/70 font-semibold">
              Restricted Vault Access
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1.5">
            Admin Login
          </h1>
          <p className="text-xs sm:text-sm font-mono text-white/50 mb-7">
            Enter your 4-digit PIN to access the dashboard
          </p>

          {/* Form */}
          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-mono text-white/60 uppercase tracking-wider font-semibold">
                  Admin PIN <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] font-mono text-white/40 hover:text-white/80 transition-colors flex items-center space-x-1"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPin ? "Hide" : "Show"}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 4) {
                      setPin(val);
                      setPinError(null);
                      if (val === CORRECT_PIN) {
                        sessionStorage.setItem("admin_authenticated", "true");
                        localStorage.setItem("admin_authenticated", "true");
                        setIsAuthenticated(true);
                        setPinError(null);
                        fetchEnquiries();
                      }
                    }
                  }}
                  className="w-full text-center text-2xl font-mono tracking-[0.7em] py-3.5 px-4 rounded-2xl bg-white/[0.04] border border-white/15 text-amber-400 placeholder:text-white/20 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/40 transition-all font-bold shadow-inner"
                  autoFocus
                />
              </div>

              {pinError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center space-x-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-white text-[#0A0A0A] font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-white/90 active:scale-[0.98] transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-[11px] font-mono text-white/40 text-center mt-7 tracking-wide">
            Protected access. Authorized personnel only.
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. ADMIN DASHBOARD (When Authenticated - Dark Theme)
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#ffffff] selection:bg-white/20 selection:text-white">
      {/* Admin Navigation */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/10 px-5 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold font-mono tracking-wide">JIL VAULT CONTROL</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500 text-black font-extrabold animate-pulse">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <div className="text-[10px] font-mono text-white/40">OWNER PORTAL</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchEnquiries}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors text-xs font-mono"
            title="Refresh Enquiries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors text-xs font-mono"
            title="Lock Vault"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Vault</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Client Enquiries</h1>
            <p className="text-xs font-mono text-white/50 mt-1">
              Total Recorded: {enquiries.length} | Showing: {filteredEnquiries.length}
            </p>
          </div>

          {/* Filters & Search Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search name, email, mobile..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Objective Filter */}
            <select
              value={filterObjective}
              onChange={(e) => setFilterObjective(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/80 focus:outline-none"
            >
              <option value="All" className="bg-[#141414] text-white">All Objectives</option>
              <option value="Website" className="bg-[#141414] text-white">Website</option>
              <option value="AI Agent" className="bg-[#141414] text-white">AI Agent</option>
              <option value="Custom CRM" className="bg-[#141414] text-white">Custom CRM</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white/80 focus:outline-none"
            >
              <option value="All" className="bg-[#141414] text-white">All Statuses</option>
              <option value="new" className="bg-[#141414] text-white">New / Unread</option>
              <option value="read" className="bg-[#141414] text-white">Read</option>
              <option value="replied" className="bg-[#141414] text-white">Replied</option>
            </select>
          </div>
        </div>

        {/* Enquiries Grid / List */}
        {loadingData ? (
          <div className="py-20 text-center text-white/50 font-mono text-sm">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
            Loading Records...
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-20 text-center rounded-3xl glass-panel border border-white/10 p-8">
            <Sparkles className="w-8 h-8 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white/80">No Enquiries Found</h3>
            <p className="text-xs text-white/40 mt-1">Try submitting an enquiry from the website contact modal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredEnquiries.map((item) => {
              const isUnread = item.status === "new";
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedEnquiry(item);
                    if (item.status === "new") {
                      updateStatus(item.id, "read");
                    }
                  }}
                  className={`group relative rounded-2xl glass-panel border p-5 transition-all cursor-pointer hover:border-white/30 ${
                    isUnread
                      ? "border-amber-500/40 bg-amber-500/[0.02]"
                      : "border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="flex items-start space-x-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isUnread
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            : "bg-white/5 border-white/10 text-white/60"
                        }`}
                      >
                        {item.objective === "Website" && <Globe className="w-5 h-5" />}
                        {item.objective === "AI Agent" && <Bot className="w-5 h-5" />}
                        {item.objective === "Custom CRM" && <Database className="w-5 h-5" />}
                        {!["Website", "AI Agent", "Custom CRM"].includes(item.objective) && (
                          <MessageSquare className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                            {item.name}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                              item.status === "new"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : item.status === "read"
                                ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-white/50 mt-1">
                          <span>📧 {item.email}</span>
                          <span>📞 {item.mobile}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Metadata */}
                    <div className="flex items-center space-x-4 self-end md:self-auto">
                      <div className="text-right font-mono text-[11px] text-white/40">
                        <div>{new Date(item.created_at).toLocaleDateString()}</div>
                        <div>{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>

                      {/* Quick Status Toggle Buttons */}
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => updateStatus(item.id, "new")}
                          title="Mark as Unread"
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                            item.status === "new"
                              ? "bg-amber-500 text-black border-amber-500 font-bold"
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                          }`}
                        >
                          New
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "read")}
                          title="Mark as Read"
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                            item.status === "read"
                              ? "bg-sky-500 text-black border-sky-500 font-bold"
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                          }`}
                        >
                          Read
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "replied")}
                          title="Mark as Replied"
                          className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                            item.status === "replied"
                              ? "bg-emerald-500 text-black border-emerald-500 font-bold"
                              : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                          }`}
                        >
                          Replied
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Snippet preview */}
                  <div className="mt-3 text-xs text-white/70 line-clamp-2 pl-14 font-normal">
                    {item.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-[#0A0A0A]/85 backdrop-blur-xl"
            onClick={() => setSelectedEnquiry(null)}
          />

          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 z-10 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] my-8">
            <button
              onClick={() => setSelectedEnquiry(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono uppercase font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                {selectedEnquiry.objective}
              </span>
              <span className="text-xs font-mono text-white/40">
                {new Date(selectedEnquiry.created_at).toLocaleString()}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">{selectedEnquiry.name}</h2>

            {/* Structured Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-6 font-mono text-xs">
              <div>
                <span className="text-white/40 block mb-1">DIRECT EMAIL</span>
                <a
                  href={`mailto:${selectedEnquiry.email}`}
                  className="text-sky-400 underline font-semibold"
                >
                  {selectedEnquiry.email}
                </a>
              </div>

              <div>
                <span className="text-white/40 block mb-1">MOBILE NUMBER</span>
                <a
                  href={`tel:${selectedEnquiry.mobile}`}
                  className="text-emerald-400 font-semibold"
                >
                  {selectedEnquiry.mobile}
                </a>
              </div>

              <div>
                <span className="text-white/40 block mb-1">STATUS</span>
                <span className="text-amber-400 uppercase font-bold">{selectedEnquiry.status}</span>
              </div>
            </div>

            {/* Full Message Context */}
            <div className="mb-6">
              <label className="block text-xs font-mono text-white/40 uppercase mb-2">
                Project Context & Bottlenecks
              </label>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white/90 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-white/50">Update Status:</span>
                <button
                  onClick={() => updateStatus(selectedEnquiry.id, "new")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    selectedEnquiry.status === "new"
                      ? "bg-amber-500 text-black border-amber-500 font-bold"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => updateStatus(selectedEnquiry.id, "read")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    selectedEnquiry.status === "read"
                      ? "bg-sky-500 text-black border-sky-500 font-bold"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  Read
                </button>
                <button
                  onClick={() => updateStatus(selectedEnquiry.id, "replied")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    selectedEnquiry.status === "replied"
                      ? "bg-emerald-500 text-black border-emerald-500 font-bold"
                      : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  Replied
                </button>
              </div>

              <a
                href={`mailto:${selectedEnquiry.email}?subject=Re: Your Enquiry regarding ${selectedEnquiry.objective}`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white text-[#0A0A0A] font-semibold text-xs flex items-center space-x-2 hover:bg-white/90 transition-all shadow-lg"
              >
                <span>Reply via Gmail</span>
                <Send className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
