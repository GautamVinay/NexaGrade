"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ExternalLink } from "lucide-react";

/* ─── Platform Config ─── */
const platformConfigs = [
  { key: "leetcode", label: "LeetCode", initials: "LC", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { key: "codechef", label: "CodeChef", initials: "CC", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { key: "codeforces", label: "Codeforces", initials: "CF", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { key: "hackerrank", label: "HackerRank", initials: "HR", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { key: "geeksforgeeks", label: "GeeksForGeeks", initials: "GF", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  { key: "hackerearth", label: "HackerEarth", initials: "HE", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { key: "atcoder", label: "AtCoder", initials: "AC", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { key: "interviewbit", label: "InterviewBit", initials: "IB", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
  { key: "codewars", label: "Codewars", initials: "CW", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  { key: "topcoder", label: "TopCoder", initials: "TC", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" },
];

export function StudentProfileModal({ student, onClose }: { student: any; onClose: () => void }) {
  // Collect linked platforms (only those with a URL value)
  const linkedPlatforms = platformConfigs.filter(p => student[p.key] && student[p.key].trim() !== "");

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4 bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        >
          {/* ── Close Button ── */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ── Profile Header ── */}
          <div className="relative px-6 pt-6 pb-5 border-b border-slate-800">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-slate-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate">
                  {student.name}
                </h3>
                <div className="mt-1 space-y-0.5">
                  <p className="text-sm text-slate-400 font-mono">
                    RA: {student.ra || student.raNumber || "N/A"}
                  </p>
                  <p className="text-sm text-slate-400">
                    Email: {student.email || "N/A"}
                  </p>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400">
                    {student.branch || "CSE Core"}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400">
                    Section {student.section || "A1"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Linked Platform Handles ── */}
          <div className="px-6 py-5">
            <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
              Linked Platform Handles
            </h4>

            {linkedPlatforms.length === 0 ? (
              <p className="text-sm text-slate-500 italic">No platform handles linked yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {linkedPlatforms.map((platform) => {
                  const url = student[platform.key];
                  return (
                    <a
                      key={platform.key}
                      href={url.startsWith("http") ? url : `https://${url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
                    >
                      {/* Platform Initial Icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border ${platform.color}`}>
                        {platform.initials}
                      </div>

                      {/* Platform Name & URL */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {platform.label}
                        </div>
                        <div className="text-xs text-slate-500 truncate font-mono">
                          {url}
                        </div>
                      </div>

                      {/* External Link Icon */}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
