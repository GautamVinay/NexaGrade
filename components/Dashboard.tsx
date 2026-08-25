"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Eye, X, Plus, Download, CheckCircle, ExternalLink, Globe } from "lucide-react";
import { LeetCodeActivityCell } from "@/components/LeetCodeActivityCell";

/** Extract a LeetCode username from a profile URL */
function extractLeetCodeUsername(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  const match = url.trim().replace(/\/$/, "").match(/leetcode\.com\/(?:u\/)?([a-zA-Z0-9_.-]+)/);
  return match ? match[1] : undefined;
}

/** Converts a date/timestamp into a human-readable relative string like "2 hours ago" */
function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

interface DashboardProps {
  currentUser: any | null;
  userRole: "student" | "faculty" | null;
  onUserUpdate?: (updatedUser: any) => void;
}

const platformsList = [
  { id: "leetcode", label: "LeetCode", placeholder: "https://leetcode.com/username" },
  { id: "codeforces", label: "Codeforces", placeholder: "https://codeforces.com/profile/username" },
  { id: "codechef", label: "CodeChef", placeholder: "https://codechef.com/users/username" },
  { id: "hackerrank", label: "HackerRank", placeholder: "https://hackerrank.com/username" },
  { id: "geeksforgeeks", label: "GeeksForGeeks", placeholder: "https://auth.geeksforgeeks.org/user/username" },
  { id: "atcoder", label: "AtCoder", placeholder: "https://atcoder.jp/users/username" },
  { id: "hackerearth", label: "HackerEarth", placeholder: "https://hackerearth.com/@username" },
  { id: "interviewbit", label: "InterviewBit", placeholder: "https://interviewbit.com/profile/username" },
  { id: "codewars", label: "Codewars", placeholder: "https://codewars.com/users/username" },
  { id: "topcoder", label: "TopCoder", placeholder: "https://topcoder.com/members/username" },
];

/* ─── Removed Mock Data: Now fetched from DB ─── */

/* ═══════════ Upgraded Profile Header ═══════════ */
function ProfileHeader({
  name,
  ra,
  email,
  branch,
  section,
  idLabel = "RA:",
}: {
  name: string;
  ra: string;
  email: string;
  branch: string;
  section: string;
  idLabel?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-start gap-5 min-w-0 w-full">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 self-start sm:self-center">
          <User className="w-8 h-8 text-blue-500 dark:text-amber-500" />
        </div>
        <div className="space-y-3 min-w-0 flex-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {name}
          </h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 dark:text-slate-500 font-medium">{idLabel}</span>
              <span className="font-mono text-slate-800 dark:text-slate-100 font-bold select-all">{ra}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Email:</span>
              <span className="text-slate-800 dark:text-slate-100 font-semibold truncate select-all">{email}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5 shrink-0">
        <span className="px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-150 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold tracking-wide">
          {branch}
        </span>
        <span className="px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-amber-500/10 border border-emerald-150 dark:border-amber-500/20 text-emerald-600 dark:text-amber-400 text-xs sm:text-sm font-black tracking-wide">
          Section {section}
        </span>
      </div>
    </div>
  );
}

/* ═══════════ Dashboard Component ═══════════ */
export default function Dashboard({ currentUser, userRole, onUserUpdate }: DashboardProps) {
  // Hydrate linked platforms from currentUser's real DB fields
  const hydrateLinkedPlatforms = (user: any): Array<{ id: string; label: string; url: string }> => {
    if (!user) return [];
    const result: Array<{ id: string; label: string; url: string }> = [];
    for (const plat of platformsList) {
      const dbValue = user[plat.id];
      if (dbValue && typeof dbValue === "string" && dbValue.trim() !== "") {
        result.push({ id: plat.id, label: plat.label, url: dbValue });
      }
    }
    return result;
  };

  // Student Linked Platforms State — initialized from real DB data, NO mock data
  const [linkedPlatforms, setLinkedPlatforms] = useState<Array<{ id: string; label: string; url: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Stabilize: depend on a primitive that changes when the user record updates
  // updatedAt changes on every DB write, so platform hydration re-runs after PATCH
  const currentUserUpdatedAt = currentUser?.updatedAt ?? currentUser?.id ?? null;

  // Re-hydrate whenever currentUser changes (e.g. after login or after API update)
  useEffect(() => {
    if (userRole === "student" && currentUser) {
      setLinkedPlatforms(hydrateLinkedPlatforms(currentUser));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserUpdatedAt, userRole]);

  // ── Smart Background Auto-Sync ──
  // Silently call /api/sync/auto once when a student opens the dashboard.
  // The API enforces a 1-hour cooldown, so this is safe to fire on every mount.
  // No loading spinners — completely invisible to the user.
  useEffect(() => {
    if (userRole !== "student" || !currentUser?.raNumber) return;

    const controller = new AbortController();

    const runAutoSync = async () => {
      try {
        const res = await fetch("/api/sync/auto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ raNumber: currentUser.raNumber }),
          signal: controller.signal,
        });

        if (!res.ok) return; // fail silently

        const data = await res.json();

        // If the API actually synced fresh data, update the global user state
        if (data.synced && data.user && onUserUpdate) {
          onUserUpdate(data.user);
        }
      } catch (err: unknown) {
        // AbortError is expected on unmount, ignore it
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error("[AutoSync] Background sync failed silently:", err);
      }
    };

    runAutoSync();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.raNumber, userRole]);

  // Form states for adding platforms
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlatformId, setSelectedPlatformId] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Faculty states
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [sectionStudents, setSectionStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Stabilize dependency to a primitive to prevent infinite re-render loops.
  const facultySection = currentUser?.sectionInCharge ?? null;

  useEffect(() => {
    if (userRole === "faculty" && facultySection) {
      setIsLoadingStudents(true);
      fetch('/api/students')
        .then(res => {
          if (!res.ok) throw new Error('API returned ' + res.status);
          return res.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            console.error('Expected array from /api/students, got:', data);
            setSectionStudents([]);
            return;
          }
          const filtered = data.filter((s: any) => s.section === facultySection);
          setSectionStudents(filtered);
        })
        .catch(err => {
          console.error("Error fetching students:", err);
          setSectionStudents([]);
        })
        .finally(() => setIsLoadingStudents(false));
    }
  }, [userRole, facultySection]);

  // Scroll lock for modal dialogs
  useEffect(() => {
    if (selectedStudent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [selectedStudent]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // Add platform profile — calls real PATCH /api/profile endpoint
  const handleAddPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlatformId || !profileUrl) return;
    setSaveError(null);

    const platMeta = platformsList.find((p) => p.id === selectedPlatformId);
    if (!platMeta) return;

    try {
      setIsSaving(true);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raNumber: currentUser?.raNumber,
          platformId: selectedPlatformId,
          url: profileUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Failed to save platform link.');
        return;
      }

      // Update parent state with the fresh user from the DB
      if (onUserUpdate && data.user) {
        onUserUpdate(data.user);
      }

      // Also update local state immediately
      const updated = linkedPlatforms.filter((p) => p.id !== selectedPlatformId);
      setLinkedPlatforms([...updated, { id: selectedPlatformId, label: platMeta.label, url: profileUrl.trim() }]);

      // Reset add form
      setSelectedPlatformId("");
      setProfileUrl("");
      setShowAddForm(false);

      // Show success
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Network error while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Remove platform handle — calls PATCH with null URL to clear the DB field
  const handleRemovePlatform = async (id: string) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raNumber: currentUser?.raNumber,
          platformId: id,
          url: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to remove platform:', data.error);
        return;
      }

      // Update parent state
      if (onUserUpdate && data.user) {
        onUserUpdate(data.user);
      }

      // Update local state
      setLinkedPlatforms(linkedPlatforms.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error removing platform:', err);
    }
  };

  // Sync platforms by calling the Universal Sync Engine API
  const handleSyncPlatforms = async () => {
    if (!currentUser?.raNumber) return;
    try {
      setIsSyncing(true);
      setSaveError(null);
      const res = await fetch('/api/sync/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raNumber: currentUser.raNumber }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Failed to sync platforms.');
        return;
      }
      
      // Update global user state with new scores
      if (onUserUpdate && data.user) {
        onUserUpdate(data.user);
      }
      
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Network error while syncing.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* ═══════════ Student View ═══════════ */}
      {userRole === "student" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Profile Header */}
          <ProfileHeader
            name={currentUser?.name || "Student"}
            ra={currentUser?.raNumber || currentUser?.ra || "N/A"}
            email={currentUser?.email || "student@srmist.edu.in"}
            branch={currentUser?.branch || "N/A"}
            section={currentUser?.section || "N/A"}
          />

          {/* Platforms Link Configuration Card */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Linked Coding Platforms
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Manage your verified coding profiles to maintain automated NexaGrade sync.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSyncPlatforms}
                  disabled={isSyncing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-300
                    bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  <span>{isSyncing ? "Syncing..." : "Sync Platforms"}</span>
                </motion.button>
              
                {!showAddForm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-300
                      bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                      dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Platform</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Dynamic Add Platform Inline Form Card */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-5 sm:p-6 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                      Link New Coding Account
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  <form onSubmit={handleAddPlatform} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-4 space-y-1.5">
                      <label className="label-text">Select Platform</label>
                      <select
                        value={selectedPlatformId}
                        onChange={(e) => setSelectedPlatformId(e.target.value)}
                        className="glass-select focus:ring-2 focus:ring-blue-600"
                        required
                      >
                        <option value="" className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">Choose platform...</option>
                        {platformsList.map((plat) => (
                          <option key={plat.id} value={plat.id} className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">
                            {plat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-6 space-y-1.5">
                      <label className="label-text">Profile URL / Link</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        className="glass-input"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <motion.button
                        whileHover={{ scale: isSaving ? 1 : 1.02 }}
                        whileTap={{ scale: isSaving ? 1 : 0.98 }}
                        type="submit"
                        disabled={isSaving}
                        className={`w-full py-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-300
                          bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                          dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black
                          ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {isSaving ? 'Saving...' : 'Save Profile'}
                      </motion.button>
                    </div>
                  </form>

                  {saveError && (
                    <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-semibold">
                      {saveError}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Feedback Alerts */}
            <AnimatePresence>
              {showSaveSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Platform synced successfully! Global rankings will update in the next sync routine.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Linked Platforms Cards List */}
            {(!linkedPlatforms || linkedPlatforms.length === 0) ? (
              <div className="p-12 border border-dashed border-slate-200 dark:border-[#27272a] rounded-2xl text-center space-y-2">
                <Globe className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-700 dark:text-slate-300">No platforms linked yet</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">Link your accounts to start generating metrics on your leaderboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {linkedPlatforms?.map((plat) => (
                  <div
                    key={plat.id}
                    className="p-5 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Logo Placeholder */}
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                        {plat.label.slice(0, 2)}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {plat.label}
                        </div>
                        <a
                          href={plat.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 dark:text-amber-500 hover:underline flex items-center gap-1 min-w-0 truncate"
                        >
                          <span className="truncate">{plat.url}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePlatform(plat.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                      title="Disconnect Account"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ Faculty View ═══════════ */}
      {userRole === "faculty" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Profile Header */}
          <ProfileHeader
            name={currentUser?.name || "Faculty Coordinator"}
            ra={currentUser?.facultyId || "N/A"}
            email={currentUser?.email || "faculty@srmist.edu.in"}
            branch="Faculty Advisor"
            section={currentUser?.sectionInCharge || "P1"}
            idLabel="Faculty ID:"
          />

          {/* Student Roster Card Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Student Roster (Section {currentUser?.sectionInCharge || "—"})
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Click the Eye icon to audit student platform handles.
                </p>
              </div>

              {/* Excel/CSV Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Build CSV header
                  const headers = ["Name", "RA Number", "Email", "Section", "LeetCode", "Codeforces", "CodeChef", "HackerRank", "GFG", "AtCoder", "HackerEarth", "InterviewBit", "Codewars", "TopCoder", "Total"];
                  const sorted = [...sectionStudents].sort((a, b) => (a.raNumber || "").localeCompare(b.raNumber || ""));
                  const rows = sorted.map((s: any) => {
                    const total = (s.leetcodeScore || 0) + (s.codeforcesScore || 0) + (s.codechefScore || 0) + (s.hackerrankScore || 0) + (s.geeksforgeeksScore || 0) + (s.atcoderScore || 0) + (s.hackerearthScore || 0) + (s.interviewbitScore || 0) + (s.codewarsScore || 0) + (s.topcoderScore || 0);
                    return [
                      `"${(s.name || "").replace(/"/g, '""')}"`,
                      s.raNumber || "",
                      s.email || "",
                      s.section || "",
                      s.leetcodeScore || 0,
                      s.codeforcesScore || 0,
                      s.codechefScore || 0,
                      s.hackerrankScore || 0,
                      s.geeksforgeeksScore || 0,
                      s.atcoderScore || 0,
                      s.hackerearthScore || 0,
                      s.interviewbitScore || 0,
                      s.codewarsScore || 0,
                      s.topcoderScore || 0,
                      total,
                    ].join(",");
                  });
                  const csvContent = [headers.join(","), ...rows].join("\n");
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "Student_Roster.csv";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs shadow-sm transition-all duration-300
                  bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                  dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
              </motion.button>
            </div>

            <div className="bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-[#18181f] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#27272a]">
                      <th className="py-3.5 px-6 font-semibold w-16 text-center">#</th>
                      <th className="py-3.5 px-4 font-semibold">Name</th>
                      <th className="py-3.5 px-4 font-semibold font-mono">RA Number</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Last Opened</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Total Solved</th>
                      <th className="py-3.5 px-6 font-semibold text-center w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                    {isLoadingStudents ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-sm font-semibold text-slate-400">Loading roster...</div>
                          </div>
                        </td>
                      </tr>
                    ) : (!sectionStudents || sectionStudents.length === 0) ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-semibold">
                          No students registered in this section yet.
                        </td>
                      </tr>
                    ) : (
                      [...sectionStudents]
                        .sort((a: any, b: any) => (a.raNumber || "").localeCompare(b.raNumber || ""))
                        .map((student: any, idx: number) => {
                          const totalSolved = (student.leetcodeScore || 0) + (student.codeforcesScore || 0) + (student.codechefScore || 0) + (student.hackerrankScore || 0) + (student.geeksforgeeksScore || 0) + (student.atcoderScore || 0) + (student.hackerearthScore || 0) + (student.interviewbitScore || 0) + (student.codewarsScore || 0) + (student.topcoderScore || 0);
                          return (
                        <tr
                          key={student?.ra || student?.raNumber || idx}
                          className="hover:bg-slate-100/50 dark:hover:bg-[#18181f]/40 transition-colors"
                        >
                          <td className="py-4 px-6 text-center font-mono font-medium">{idx + 1}</td>
                          <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                            {student?.name || "Unknown"}
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {student?.raNumber || student?.ra || "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <LeetCodeActivityCell username={extractLeetCodeUsername(student?.leetcode)} />
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-yellow-500 dark:text-yellow-400">
                            {totalSolved}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-amber-400 transition-colors"
                              title="Audit Platform Profiles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ Read-Only Student Profile Detail Modal (Faculty View) ═══════════ */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Modal Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedStudent(null)}
          />
          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] shadow-lg dark:shadow-glass rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#27272a]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Audit Student Profile
              </h3>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Upgrade Profile Header Design */}
              <ProfileHeader
                name={selectedStudent?.name || "Student"}
                ra={selectedStudent?.raNumber || selectedStudent?.ra || "N/A"}
                email={selectedStudent?.email || "N/A"}
                branch={selectedStudent?.branch || "N/A"}
                section={selectedStudent?.section || "N/A"}
              />

              {/* Platform Links List Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Linked Platform Handles
                </h4>

                {(!selectedStudent || hydrateLinkedPlatforms(selectedStudent).length === 0) ? (
                  <div className="p-10 border border-dashed border-slate-200 dark:border-[#27272a] rounded-xl text-center">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      No platforms linked yet.
                    </span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {hydrateLinkedPlatforms(selectedStudent).map((plat) => (
                      <div
                        key={plat.id}
                        className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 rounded-xl flex items-center gap-3.5"
                      >
                        {/* Logo Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                          {plat.label.slice(0, 2)}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <span className="block font-bold text-xs text-slate-900 dark:text-white capitalize">
                            {plat.label}
                          </span>
                          <a
                            href={plat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] sm:text-xs text-blue-500 hover:underline flex items-center gap-1 min-w-0"
                          >
                            <span className="truncate">{plat.url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Close Actions */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-[#27272a] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-[#27272a] text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
