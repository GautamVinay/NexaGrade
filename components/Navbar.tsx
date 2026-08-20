"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Sun,
  Moon,
  LayoutDashboard,
  Trophy,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";

interface NavbarProps {
  activeView: "home" | "leaderboard" | "dashboard";
  onViewChange: (view: "home" | "leaderboard" | "dashboard") => void;
  onLoginClick: () => void;
  currentUser: any | null;
  userRole: "student" | "faculty" | null;
  onLogout: () => void;
}

const navTabs = [
  { key: "home" as const, label: "Home", icon: LayoutDashboard },
  { key: "leaderboard" as const, label: "Leaderboard", icon: Trophy },
  { key: "dashboard" as const, label: "Dashboard", icon: User },
];

export default function Navbar({
  activeView,
  onViewChange,
  onLoginClick,
  currentUser,
  userRole,
  onLogout,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter tabs dynamically based on login status
  const activeTabs = currentUser
    ? navTabs
    : navTabs.filter((t) => t.key !== "dashboard");

  const formatUserGreeting = () => {
    if (!currentUser) return "";
    if (userRole === "student") {
      const ra = currentUser.ra || currentUser.raNumber || "";
      return `Hi, ${ra.length > 8 ? ra.slice(0, 4) + "..." + ra.slice(-3) : ra}`;
    } else {
      return `Hi, ${currentUser.name || "Faculty"}`;
    }
  };

  return (
    <>
      {/* ═══════════ Desktop / Tablet Top Nav ═══════════ */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        } px-3 sm:px-6`}
      >
        <div
          className={`max-w-7xl mx-auto flex items-center justify-between
            glass-panel rounded-full
            transition-all duration-300
            ${scrolled ? "px-4 py-2 shadow-glass" : "px-6 py-3"}`}
        >
          {/* ── Left: Brand ── */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-amber-500/10 flex items-center justify-center">
              <Image alt="NexaGrade" className="object-contain" height={36} priority src="/logo.png" width={36} />
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                NexaGrade
              </div>
              <div className="hidden md:block text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight truncate">
                SRM Institute of Science &amp; Technology
              </div>
            </div>
          </div>

          {/* ── Center: Desktop Segmented Tabs ── */}
          <div className="hidden md:flex relative bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-md border border-slate-300/30 dark:border-slate-600/30 rounded-full p-1">
            {activeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onViewChange(tab.key)}
                className={`relative px-5 lg:px-7 py-2 text-sm z-10 transition-colors duration-200 rounded-full ${
                  activeView === tab.key
                    ? "text-white dark:text-black font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {activeView === tab.key && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-slate-900 dark:bg-amber-500 rounded-full"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-300/30 dark:border-slate-600/30 transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && (
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === "dark" ? 360 : 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                >
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-blue-500" />
                  )}
                </motion.div>
              )}
            </motion.button>

            {currentUser ? (
              /* ── Logged In User State ── */
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#27272a] bg-slate-50 dark:bg-[#111115] text-xs font-semibold">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-amber-500" />
                  <span>{formatUserGreeting()}</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-300
                    border-red-200 hover:bg-red-50 text-red-600
                    dark:border-red-500/20 dark:hover:bg-red-500/10 dark:text-red-400 bg-transparent"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              /* ── Logged Out State ── */
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full
                  text-sm transition-all duration-300
                  bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white font-bold
                  dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black dark:font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Portal Login</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      {/* ═══════════ Mobile Bottom Nav ═══════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-4 pb-[env(safe-area-inset-bottom,8px)]">
        <div className="glass-panel-strong rounded-2xl mx-auto max-w-sm flex items-center justify-around p-1 mb-2">
          {activeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.9 }}
                onClick={() => onViewChange(tab.key)}
                className={`relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                  isActive
                    ? "text-white dark:text-black font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 bg-slate-900 dark:bg-amber-500 rounded-xl"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-semibold relative z-10">
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
