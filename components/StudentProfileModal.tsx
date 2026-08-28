"use client";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

export function StudentProfileModal({ student, onClose }: { student: any; onClose: () => void }) {
  // ── Crash-proof URL & username parsing ──
  const rawUrl: string = student?.leetcodeUsername || student?.leetcode || "";
  const leetcodeUsername: string = rawUrl
    ? rawUrl.replace("https://leetcode.com/u/", "").replace("https://leetcode.com/", "").replace(/\/+$/, "")
    : "N/A";

  const leetcodeLink: string = rawUrl.startsWith("http")
    ? rawUrl
    : rawUrl
      ? `https://leetcode.com/u/${leetcodeUsername}`
      : "";
  const hasLeetcode: boolean = rawUrl.trim() !== "";

  // ── Portal mount target (must wait for client-side hydration) ──
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const modalContent = (
    <AnimatePresence>
      {/* ── Fixed Overlay — z-[9999] to guarantee it sits above everything ── */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* ── Inner Card — solid bg, min-height, stopPropagation ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg mx-4 min-h-[300px] bg-[#0f172a] border border-slate-800 shadow-2xl shadow-black/40 rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
        >
          {/* ══════════════════════════════════════════════════
              1. TOP SECTION – Profile Box
          ══════════════════════════════════════════════════ */}
          <div className="m-5 rounded-xl border border-slate-700/70 bg-slate-800/40 p-5">
            <div className="flex items-start gap-4">
              {/* Avatar – dark brown/amber tint */}
              <div className="w-14 h-14 rounded-full bg-amber-900/30 border-2 border-amber-700/50 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-amber-400/80" />
              </div>

              {/* Name / RA / Email */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white truncate">
                  {student?.name || "Unknown"}
                </h3>

                <div className="mt-1.5 space-y-0.5">
                  <p className="text-sm">
                    <span className="text-slate-500">RA: </span>
                    <span className="text-white font-mono">
                      {student?.ra || student?.raNumber || "N/A"}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-slate-500">Email: </span>
                    <span className="text-white">
                      {student?.email || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Pill Badges – right aligned */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0 pt-0.5">
                <span className="px-2.5 py-1 text-xs font-bold rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 whitespace-nowrap">
                  {student?.branch || "CSE Core"}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full border border-yellow-500/40 bg-yellow-500/10 text-yellow-400 whitespace-nowrap">
                  Section {student?.section || "A1"}
                </span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              2. MIDDLE SECTION – Linked Platform Handles
          ══════════════════════════════════════════════════ */}
          <div className="px-5 pb-5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Linked Platform Handles
            </h4>

            {hasLeetcode ? (
              <a
                href={leetcodeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
              >
                {/* LE circle icon */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  LE
                </div>

                {/* Platform name & URL */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                    LeetCode
                  </div>
                  <div className="text-xs text-blue-400 truncate font-mono">
                    {rawUrl || leetcodeLink}
                  </div>
                </div>

                {/* External link icon */}
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </a>
            ) : (
              <p className="text-sm text-slate-500 italic">No platform handles linked yet.</p>
            )}
          </div>

          {/* ══════════════════════════════════════════════════
              3. BOTTOM FOOTER – Divider + Close Audit Button
          ══════════════════════════════════════════════════ */}
          <div className="border-t border-slate-700/70">
            <div className="flex justify-end px-5 py-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-300 bg-white/5 border border-slate-700/60 rounded-lg hover:bg-white/10 hover:text-white hover:border-slate-600 transition-all duration-200"
              >
                Close Audit
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // ── Render via Portal to escape any overflow-hidden / transform containers ──
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
