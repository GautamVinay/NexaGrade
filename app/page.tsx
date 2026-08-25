"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  RefreshCw,
  Lock,
  Download,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/LeaderboardTable";
import AuthModal from "@/components/AuthModal";
import Dashboard from "@/components/Dashboard";

/* ─── Feature Cards (Exactly 3) ─── */
const features = [
  {
    icon: Trophy,
    title: "Multi-platform leaderboard",
    description: "Unified college rankings across all major competitive programming platforms in a high-density, real-time table.",
  },
  {
    icon: RefreshCw,
    title: "Automatic rating sync",
    description: "Automated background refresh of student handles, rankings, and problem counts — no manual spreadsheets.",
  },
  {
    icon: Lock,
    title: "Secure college login",
    description: "Student identity verification using domain-restricted srmist.edu.in emails with hashed password security.",
  },
];

/* ─── Fetch real Top Students in component ─── */

export default function Page() {
  const [activeView, setActiveView] = useState<"home" | "leaderboard" | "dashboard">("home");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<"student" | "faculty" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ studentCount: 0, totalProblemsSolved: 0, colleges: 1 });

  // Restore session from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role") as "student" | "faculty" | null;
    if (storedUser && storedRole) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setUserRole(storedRole);
        setActiveView("dashboard");
      } catch (e) {
        console.error("Failed to parse stored user", e);
      }
    }
    setIsLoading(false);

    // Fetch live top students with LeetCode points
    fetch("/api/students")
      .then(res => res.json())
      .then(async (data) => {
        if (Array.isArray(data)) {
          const enriched = await Promise.all(
            data.map(async (s: any) => {
              try {
                let username = "";
                const raw = (s.leetcode || "").trim();
                if (raw.includes("/u/")) {
                  username = raw.split("/u/")[1]?.replace(/\/+$/, "") || "";
                } else if (raw.includes("leetcode.com/")) {
                  username = raw.split("leetcode.com/")[1]?.replace(/\/+$/, "") || "";
                } else {
                  username = raw.replace(/\/+$/, "");
                }
                if (!username) return { ...s, points: 0, totalQuestions: 0 };

                const res = await fetch(`/api/leetcode-stats?username=${encodeURIComponent(username)}`);
                const stats = await res.json();
                const points = ((stats.hard || 0) * 5) + ((stats.medium || 0) * 3) + ((stats.easy || 0) * 1);
                const totalQuestions = (stats.hard || 0) + (stats.medium || 0) + (stats.easy || 0);
                return { ...s, points, totalQuestions };
              } catch {
                return { ...s, points: 0, totalQuestions: 0 };
              }
            })
          );
          const sorted = enriched.sort((a: any, b: any) => b.points - a.points);
          setTopStudents(sorted.slice(0, 4));
        }
      })
      .catch(err => console.error("Failed to fetch top students", err));

    // Fetch live stats
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setLiveStats({
          studentCount: data.studentCount || 0,
          totalProblemsSolved: data.totalProblemsSolved || 0,
          colleges: data.colleges || 1,
        });
      })
      .catch(err => console.error("Failed to fetch stats", err));
  }, []);

  const handleViewChange = (view: "home" | "leaderboard" | "dashboard") => {
    if (view === "dashboard" && !currentUser) {
      setIsAuthOpen(true);
    } else {
      setActiveView(view);
    }
  };

  const handleLoginSuccess = (user: any, role: "student" | "faculty") => {
    // Close the auth modal FIRST to release scroll/pointer locks
    // before setting state that triggers Dashboard rendering.
    setIsAuthOpen(false);
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
    setCurrentUser(user);
    setUserRole(role);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("role", role);
    setActiveView("dashboard");

    // Safety net: force-clear body locks after the modal exit animation (200ms)
    // in case framer-motion's AnimatePresence stalls during the re-render storm.
    setTimeout(() => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }, 350);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setActiveView("home");
  };

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 overflow-x-hidden font-sans">
      
      {/* ─── Aurora Background ─── */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-teal-400/30 dark:bg-emerald-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-400/30 dark:bg-indigo-600/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-purple-400/30 dark:bg-purple-800/20 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* ─── Navbar ─── */}
      <Navbar
        activeView={activeView}
        onViewChange={handleViewChange}
        onLoginClick={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        userRole={userRole}
        onLogout={handleLogout}
      />

      <div className="relative z-10 pt-24 sm:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeView === "home" ? (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-24 pb-24"
            >
              {/* ═══════════ Hero Section (Split View) ═══════════ */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center pt-8 sm:pt-12">
                
                {/* ── Left Column: Text & CTAs ── */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Top Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                    bg-slate-100 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-purple-400" />
                    <span>720 students • 4 colleges • 6 platforms synced daily</span>
                  </div>

                  {/* Heading */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
                    Track every coder in your college - <span className="bg-gradient-to-r from-blue-500 to-emerald-400 dark:from-purple-400 dark:to-amber-400 bg-clip-text text-transparent">automatically</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                    Live leaderboards across Codeforces, CodeChef, LeetCode, HackerRank, GeeksForGeeks, and AtCoder - plus daily contests, admin analytics, and recruiter tools.
                  </p>

                  {/* Platform Badges Row */}
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#27272a] text-red-500">[CF] Codeforces</span>
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#27272a] text-amber-500">[CC] CodeChef</span>
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#27272a] text-yellow-600 dark:text-yellow-400">[LC] LeetCode</span>
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#27272a] text-emerald-500">[HR] HackerRank</span>
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#27272a] text-green-500">[GFG] GeeksForGeeks</span>
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-[#27272a] text-sky-500">[AC] AtCoder</span>
                    <span className="px-2 py-1 rounded border text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-400/30 bg-purple-50 dark:bg-purple-400/10">[HE] HackerEarth</span>
                    <span className="px-2 py-1 rounded border text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-400/30 bg-teal-50 dark:bg-teal-400/10">[IB] InterviewBit</span>
                    <span className="px-2 py-1 rounded border text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-400/30 bg-orange-50 dark:bg-orange-400/10">[CW] Codewars</span>
                    <span className="px-2 py-1 rounded border text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-400/30 bg-slate-100 dark:bg-slate-400/10">[TC] TopCoder</span>
                  </div>

                  {/* Call to Action Row */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!currentUser && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsAuthOpen(true)}
                        className="px-8 py-4 rounded-xl text-center text-sm font-bold shadow-sm transition-all duration-300
                          bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                          dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black"
                      >
                        Student Login
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => currentUser ? setActiveView("dashboard") : setIsAuthOpen(true)}
                      className="px-8 py-4 rounded-xl text-center text-sm font-bold border transition-all duration-300
                        border-slate-200 text-slate-800 hover:bg-slate-100
                        dark:border-[#27272a] dark:text-slate-200 dark:hover:bg-white/5 bg-transparent"
                    >
                      {currentUser ? "Go to Dashboard" : "Get your college dashboard"}
                    </motion.button>
                  </div>

                  {/* Bullet Points */}
                  <div className="pt-4 space-y-3.5 border-t border-slate-200 dark:border-[#27272a] max-w-xl">
                    <div className="flex items-start gap-2.5 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-amber-500 mt-2 flex-shrink-0" />
                      <p><strong>Auto-sync daily</strong> – ratings from all six platforms, no manual spreadsheets.</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-amber-500 mt-2 flex-shrink-0" />
                      <p><strong>Contests built in</strong> – daily practice and live judged coding events.</p>
                    </div>
                    <div className="flex items-start gap-2.5 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-amber-500 mt-2 flex-shrink-0" />
                      <p><strong>Placement-ready</strong> – recruiter portal, analytics, and CSV export.</p>
                    </div>
                  </div>
                </div>

                {/* ── Left Column: Live Leaderboard Card Preview ── */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-md bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-2xl shadow-xl dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#27272a]">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">College Leaderboard</h3>
                      </div>
                      <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#27272a] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-600 dark:text-slate-300">
                        <Download className="w-3.5 h-3.5" />
                        <span>Export as Excel</span>
                      </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-[#18181f] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#27272a]">
                            <th className="py-2.5 px-4 font-semibold w-10">#</th>
                            <th className="py-2.5 px-3 font-semibold">STUDENT</th>
                            <th className="py-2.5 px-2 font-semibold text-center text-purple-400">POINTS</th>
                            <th className="py-2.5 px-4 font-semibold text-right">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#27272a]">
                          {topStudents.map((row, idx) => (
                            <tr key={row.raNumber || idx} className="hover:bg-slate-100/50 dark:hover:bg-[#18181f]/40 transition-colors">
                              <td className="py-3 px-4 font-mono font-medium">
                                {idx === 0 ? "🏆" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                              </td>
                              <td className="py-3 px-3">
                                <div className={`font-semibold ${idx === 0 ? 'text-amber-500' : 'text-slate-900 dark:text-slate-100'}`}>{row.name || "Student"}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">{row.raNumber || "N/A"}</div>
                              </td>
                              <td className="py-3 px-2 text-center font-bold font-mono text-purple-400">{row.points ?? 0}</td>
                              <td className="py-3 px-4 text-right font-bold font-mono text-slate-300">{row.totalQuestions ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>

              {/* ═══════════ Stats Row (Live Data) ═══════════ */}
              <div className="bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-2xl py-8 px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#27272a]">
                <div className="pt-4 md:pt-0">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{liveStats.studentCount}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Registered Students</div>
                </div>
                <div className="pt-4 md:pt-0">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{liveStats.totalProblemsSolved.toLocaleString()}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Total Problems Solved</div>
                </div>
                <div className="pt-4 md:pt-0">
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{liveStats.colleges}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Institution</div>
                </div>
              </div>

              {/* ═══════════ Features Grid (Bento Box Style) ═══════════ */}
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Unified System Features</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">Leaderboards, contests, live coding, admin analytics...</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                  {features.map((feat, idx) => {
                    const Icon = feat.icon;
                    return (
                      <div
                        key={idx}
                        className="p-6 bg-slate-50 dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] rounded-xl hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-purple-900/10 border border-blue-100 dark:border-purple-500/20 flex items-center justify-center mb-4">
                          <Icon className="w-5 h-5 text-blue-500 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : activeView === "leaderboard" ? (
            /* ═══════════ Leaderboard View ═══════════ */
            <motion.div
              key="leaderboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pb-24"
            >
              <LeaderboardTable />
            </motion.div>
          ) : (
            /* ═══════════ Dashboard View ═══════════ */
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="pb-24"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : currentUser ? (
                <Dashboard currentUser={currentUser} userRole={userRole} onUserUpdate={(updatedUser) => {
                  setCurrentUser(updatedUser);
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <h2 className="text-xl font-bold">Please log in to access your dashboard</h2>
                  <button onClick={() => setIsAuthOpen(true)} className="px-6 py-2 bg-blue-500 text-white rounded-lg">Login</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Auth Modal ─── */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}
