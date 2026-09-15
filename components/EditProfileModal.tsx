"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Loader2, CheckCircle, AlertCircle, Edit2 } from "lucide-react";

interface EditProfileModalProps {
  /** The current logged-in student object */
  student: {
    raNumber: string;
    name?: string;
    email?: string;
    branch?: string;
    section?: string;
    [key: string]: unknown;
  };
  onClose: () => void;
  /** Called with the freshly-updated user object after a successful save */
  onSave: (updatedUser: any) => void;
}

type FieldState = {
  name: string;
  email: string;
  branch: string;
  section: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function EditProfileModal({
  student,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [fields, setFields] = useState<FieldState>({
    name:    student.name    ?? "",
    email:   student.email   ?? "",
    branch:  student.branch  ?? "",
    section: student.section ?? "",
  });
  const [status, setStatus]   = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Auto-focus first field on open
  useEffect(() => {
    const t = setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (field: keyof FieldState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }));
      if (status === "error") { setStatus("idle"); setErrorMsg(""); }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raNumber: student.raNumber,
          name:     fields.name.trim(),
          email:    fields.email.trim(),
          branch:   fields.branch.trim(),
          section:  fields.section.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error ?? "Failed to save. Please try again.");
        return;
      }

      setStatus("success");
      // Short success flash, then close
      setTimeout(() => {
        onSave(data.user);
        onClose();
      }, 900);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection.");
    }
  };

  return (
    <AnimatePresence>
      {/* ── Backdrop ── */}
      <motion.div
        key="edit-profile-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
        aria-label="Edit Profile"
      >
        {/* Click-away to close */}
        <div
          className="absolute inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
          onClick={onClose}
        />

        {/* ── Modal Panel ── */}
        <motion.div
          key="edit-profile-panel"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="relative z-10 w-full max-w-md"
        >
          <div
            className="
              bg-white dark:bg-[#0e0e12]
              border border-slate-200 dark:border-[#2a2a35]
              shadow-xl dark:shadow-[0_0_60px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.04)]
              rounded-2xl overflow-hidden
            "
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-200 dark:border-[#1f1f29]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <Edit2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  Edit Profile
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/8 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* ── RA Read-Only Badge ── */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
                <span className="text-xs text-slate-500 dark:text-slate-500 font-medium shrink-0">RA Number</span>
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 select-all">
                  {student.raNumber}
                </span>
                <span className="ml-auto text-[10px] font-semibold text-slate-500 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-full tracking-wide">
                  LOCKED
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-600 pl-1">
                RA Number and password cannot be changed here.
              </p>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ep-name"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase"
                >
                  Full Name
                </label>
                <input
                  id="ep-name"
                  ref={firstInputRef}
                  type="text"
                  required
                  value={fields.name}
                  onChange={handleChange("name")}
                  disabled={status === "loading" || status === "success"}
                  placeholder="Your full name"
                  className="
                    w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
                    text-slate-900 dark:text-white
                    bg-slate-50 dark:bg-[#131318]
                    border border-slate-300 dark:border-[#2a2a35]
                    placeholder-slate-400 dark:placeholder-slate-600
                    focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
                    disabled:opacity-50 transition-colors
                  "
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ep-email"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase"
                >
                  Email Address
                </label>
                <input
                  id="ep-email"
                  type="email"
                  required
                  value={fields.email}
                  onChange={handleChange("email")}
                  disabled={status === "loading" || status === "success"}
                  placeholder="you@srmist.edu.in"
                  className="
                    w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
                    text-slate-900 dark:text-white
                    bg-slate-50 dark:bg-[#131318]
                    border border-slate-300 dark:border-[#2a2a35]
                    placeholder-slate-400 dark:placeholder-slate-600
                    focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
                    disabled:opacity-50 transition-colors
                  "
                />
              </div>

              {/* Course / Branch */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ep-branch"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase"
                >
                  Course
                </label>
                <input
                  id="ep-branch"
                  type="text"
                  required
                  value={fields.branch}
                  onChange={handleChange("branch")}
                  disabled={status === "loading" || status === "success"}
                  placeholder="e.g. CSE Core"
                  className="
                    w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
                    text-slate-900 dark:text-white
                    bg-slate-50 dark:bg-[#131318]
                    border border-slate-300 dark:border-[#2a2a35]
                    placeholder-slate-400 dark:placeholder-slate-600
                    focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
                    disabled:opacity-50 transition-colors
                  "
                />
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <label
                  htmlFor="ep-section"
                  className="block text-xs font-semibold text-slate-600 dark:text-slate-400 tracking-wide uppercase"
                >
                  Section
                </label>
                <input
                  id="ep-section"
                  type="text"
                  required
                  value={fields.section}
                  onChange={handleChange("section")}
                  disabled={status === "loading" || status === "success"}
                  placeholder="e.g. P1"
                  className="
                    w-full px-3.5 py-2.5 rounded-xl text-sm font-medium
                    text-slate-900 dark:text-white
                    bg-slate-50 dark:bg-[#131318]
                    border border-slate-300 dark:border-[#2a2a35]
                    placeholder-slate-400 dark:placeholder-slate-600
                    focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30
                    disabled:opacity-50 transition-colors
                  "
                />
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {status === "error" && errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                      border border-red-300 dark:border-red-500/25 bg-red-50 dark:bg-red-500/8 text-red-600 dark:text-red-400 text-xs font-medium"
                  >
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {/* Cancel */}
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === "loading" || status === "success"}
                  className="
                    flex-1 py-2.5 rounded-xl text-xs font-bold
                    border border-slate-300 dark:border-[#2a2a35]
                    text-slate-600 dark:text-slate-400
                    hover:text-slate-800 dark:hover:text-slate-200
                    hover:bg-slate-100 dark:hover:bg-white/5
                    disabled:opacity-50 transition-colors
                  "
                >
                  Cancel
                </button>

                {/* Save */}
                <motion.button
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  whileHover={{ scale: status === "idle" ? 1.02 : 1 }}
                  whileTap={{ scale: status === "idle" ? 0.97 : 1 }}
                  className={`
                    flex-1 py-2.5 rounded-xl text-xs font-bold
                    inline-flex items-center justify-center gap-2
                    transition-all duration-300 disabled:cursor-not-allowed
                    ${status === "success"
                      ? "bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-60"}
                  `}
                >
                  {status === "loading" && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {status === "success" && (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  {status === "loading" ? "Saving…"
                    : status === "success" ? "Saved!"
                    : "Save Changes"}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
