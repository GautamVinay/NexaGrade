"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, Medal, Award, Eye, X, GraduationCap, Flame } from "lucide-react";

/* ─── Types ─── */
interface Student {
  rank: number;
  name: string;
  ra: string;
  raNumber?: string;
  section: string;
  branch: string;
  codeforcesScore: number | null;
  codechefScore: number | null;
  leetcodeScore: number | null;
  hackerrankScore: number | null;
  geeksforgeeksScore: number | null;
  atcoderScore: number | null;
  hackerearthScore: number | null;
  interviewbitScore: number | null;
  codewarsScore: number | null;
  topcoderScore: number | null;
  [key: string]: any;
}

/* ─── Section Colors ─── */
const sectionColors: Record<string, string> = {
  A1: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  A2: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  B1: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  B2: "bg-green-500/20 text-green-400 border-green-500/30",
  C1: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  C2: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  D1: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  D2: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  E1: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  E2: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  F1: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  F2: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  G1: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  G2: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  H1: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  H2: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  I1: "bg-red-500/20 text-red-400 border-red-500/30",
  I2: "bg-blue-600/20 text-blue-300 border-blue-600/30",
  J1: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  J2: "bg-violet-600/20 text-violet-300 border-violet-600/30",
  K1: "bg-amber-600/20 text-amber-300 border-amber-600/30",
  K2: "bg-teal-600/20 text-teal-300 border-teal-600/30",
  L1: "bg-rose-600/20 text-rose-300 border-rose-600/30",
  L2: "bg-sky-600/20 text-sky-300 border-sky-600/30",
  M1: "bg-purple-600/20 text-purple-300 border-purple-600/30",
  M2: "bg-cyan-600/20 text-cyan-300 border-cyan-600/30",
  N1: "bg-indigo-600/20 text-indigo-300 border-indigo-600/30",
  N2: "bg-pink-600/20 text-pink-300 border-pink-600/30",
  O1: "bg-green-600/20 text-green-300 border-green-600/30",
  O2: "bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-600/30",
  P1: "bg-yellow-600/20 text-yellow-300 border-yellow-600/30",
  P2: "bg-orange-600/20 text-orange-300 border-orange-600/30",
  Q1: "bg-lime-600/20 text-lime-300 border-lime-600/30",
  R1: "bg-blue-400/20 text-blue-300 border-blue-400/30",
  S1: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  T1: "bg-violet-400/20 text-violet-300 border-violet-400/30",
};

const getSectionColor = (section: string) =>
  sectionColors[section] || "bg-slate-500/20 text-slate-400 border-slate-500/30";

/* ─── Removed Mock Data: Now fetched from DB ─── */

/* ─── Filter dropdown items ─── */
const allSections = [
  "A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2",
  "E1", "E2", "F1", "F2", "G1", "G2", "H1", "H2",
  "I1", "I2", "J1", "J2", "K1", "K2", "L1", "L2",
  "M1", "M2", "N1", "N2", "O1", "O2", "P1", "P2",
  "Q1", "R1", "S1", "T1",
];

const allBranches = [
  "CSE Core",
  "AI & ML",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "SE",
  "IT",
  "ECE",
];

/* ─── Platform configs ─── */
const platformCols = [
  { key: "hackerearthScore" as const, label: "HE", fullName: "HackerEarth", color: "text-purple-400" },
  { key: "codechefScore" as const, label: "CC", fullName: "CodeChef", color: "text-amber-400" },
  { key: "leetcodeScore" as const, label: "LC", fullName: "LeetCode", color: "text-yellow-400" },
  { key: "hackerrankScore" as const, label: "HR", fullName: "HackerRank", color: "text-emerald-400" },
  { key: "geeksforgeeksScore" as const, label: "GFG", fullName: "GeeksForGeeks", color: "text-green-400" },
  { key: "totalScore" as const, label: "TOTAL", fullName: "Total", color: "text-yellow-400" },
];

/* ─── Stagger Variants ─── */
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

/* ─── Rank Badge ─── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 shadow-glow-gold animate-pulse-glow">
        <Trophy className="w-4 h-4 text-yellow-400" />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/40 shadow-glow-silver">
        <Medal className="w-4 h-4 text-slate-300" />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-600/20 border border-amber-600/40 shadow-glow-bronze">
        <Award className="w-4 h-4 text-amber-500" />
      </div>
    );
  return (
    <span className="w-8 h-8 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 tabular-nums">
      {rank}
    </span>
  );
}

/* ─── Score Cell ─── */
function ScoreCell({
  value,
  color,
}: {
  value: number | null;
  color: string;
}) {
  const display = value ?? 0;
  return <span className={`${color} font-semibold tabular-nums`}>{display}</span>;
}

/* ═══════════ Main LeaderboardTable Component ═══════════ */
export default function LeaderboardTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("all");
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real students from API
  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        // Map database schema to frontend Student interface
        const formatted = data.map((s: any, idx: number) => ({
          rank: idx + 1, // temporary rank
          name: s.name || "Unknown",
          ra: s.raNumber,
          section: s.section || "A1",
          branch: s.branch || "CSE Core",
          codeforcesScore: s.codeforcesScore ?? null,
          codechefScore: s.codechefScore ?? null,
          leetcodeScore: s.leetcodeScore ?? null,
          hackerrankScore: s.hackerrankScore ?? null,
          geeksforgeeksScore: s.geeksforgeeksScore ?? null,
          atcoderScore: s.atcoderScore ?? null,
          hackerearthScore: s.hackerearthScore ?? null,
          interviewbitScore: s.interviewbitScore ?? null,
          codewarsScore: s.codewarsScore ?? null,
          topcoderScore: s.topcoderScore ?? null,
        }));
        setStudents(formatted);
      })
      .catch(err => console.error("Error fetching students:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Scroll lock for Public Profile modal
  useEffect(() => {
    if (profileStudent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [profileStudent]);

  // Compute totalScore for each student (all 10 platforms) and sort descending
  const studentsWithTotals = useMemo(() => {
    return students
      .map((s) => ({
        ...s,
        totalScore:
          (s.leetcodeScore || 0) +
          (s.codeforcesScore || 0) +
          (s.hackerrankScore || 0) +
          (s.geeksforgeeksScore || 0) +
          (s.codechefScore || 0) +
          (s.atcoderScore || 0) +
          (s.hackerearthScore || 0) +
          (s.interviewbitScore || 0) +
          (s.codewarsScore || 0) +
          (s.topcoderScore || 0),
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((s, idx) => ({ ...s, rank: idx + 1 }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return studentsWithTotals.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ra.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSection =
        sectionFilter === "all" || s.section === sectionFilter;
      const matchesBranch =
        branchFilter === "all" || s.branch === branchFilter;
      return matchesSearch && matchesSection && matchesBranch;
    });
  }, [studentsWithTotals, searchQuery, sectionFilter, branchFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Performance Leaderboard
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Live rankings across 6 competitive programming platforms
        </p>
      </div>

      {/* ── Controls Panel ── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or RA number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10"
          />
        </div>

        {/* Section Filter */}
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="glass-select sm:w-36 focus:ring-2 focus:ring-blue-600"
        >
          <option value="all" className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">All Sections</option>
          {allSections.map((s) => (
            <option key={s} value={s} className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">
              {s}
            </option>
          ))}
        </select>

        {/* Branch Filter */}
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="glass-select sm:w-44 focus:ring-2 focus:ring-blue-600"
        >
          <option value="all" className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">All Branches</option>
          {allBranches.map((b) => (
            <option key={b} value={b} className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[850px]">
          <thead>
            <tr className="sticky top-0 z-10 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xl border-y border-slate-200/50 dark:border-slate-700/50">
              <th className="px-4 sm:px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-16">
                Rank
              </th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 min-w-[200px]">
                Student
              </th>
              {platformCols.map((p) => (
                <th
                  key={p.key}
                  className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center whitespace-nowrap"
                  title={p.fullName}
                >
                  <span className="hidden lg:inline">{p.fullName}</span>
                  <span className="lg:hidden">{p.label}</span>
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center w-24">
                Profile
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {isLoading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-16 text-center text-slate-400 dark:text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-sm font-semibold">Loading real data...</div>
                  </div>
                </td>
              </tr>
            ) : (!filteredStudents || filteredStudents.length === 0) ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-16 text-center text-slate-400 dark:text-slate-500"
                >
                  <div className="text-lg font-semibold mb-1">
                    No students found
                  </div>
                  <div className="text-sm">
                    Try adjusting your search or filters
                  </div>
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => (
                <motion.tr
                  key={student?.ra || student?.raNumber || idx}
                  variants={rowVariants}
                  className="border-b border-slate-100/50 dark:border-slate-800/50
                    hover:bg-slate-100/40 dark:hover:bg-slate-800/30
                    transition-colors duration-150 group"
                >
                  {/* Rank */}
                  <td className="px-4 sm:px-6 py-3">
                    <RankBadge rank={student?.rank || 0} />
                  </td>

                  {/* Student Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white truncate">
                          {student?.name || "Student"}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-bold font-mono tabular-nums tracking-wide">
                            {student?.ra || student?.raNumber || "N/A"}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getSectionColor(
                              student?.section || "A1"
                            )}`}
                          >
                            {student?.section || "A1"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Platform Scores */}
                  {platformCols.map((p) => (
                    <td
                      key={p.key}
                      className={`px-3 py-3 text-center text-sm ${p.key === "totalScore" ? "font-bold" : ""}`}
                    >
                      <ScoreCell
                        value={student ? (student[p.key] ?? 0) : 0}
                        color={p.color}
                      />
                    </td>
                  ))}

                  {/* Profile Action */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setProfileStudent(student)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-amber-400 transition-colors"
                      title="View public profile"
                    >
                      <Eye className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </motion.tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-3 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {filteredStudents.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
            {students?.length || 0}
          </span>{" "}
          students
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Last synced: Today, 04:00 PM IST
        </span>
      </div>

      {/* ── Student Public Profile Modal ── */}
      <AnimatePresence>
        {profileStudent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl mx-4 bg-white dark:bg-[#111115] border border-slate-200 dark:border-[#27272a] shadow-lg dark:shadow-glass rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#27272a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-amber-500/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-500 dark:text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Student Coding Profile
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {profileStudent.name} • {profileStudent.ra}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProfileStudent(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Platform Statistics &amp; Metrics</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {platformCols.map((p) => {
                    const val = profileStudent ? profileStudent[p.key] : null;
                    return (
                      <div
                        key={p.key}
                        className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-1.5 text-center"
                      >
                        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {p.fullName}
                        </span>
                        <span className={`text-base font-mono font-bold ${p.color}`}>
                          {val === null || val === undefined ? "-" : val}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
