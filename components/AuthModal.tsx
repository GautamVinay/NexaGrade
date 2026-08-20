"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Info } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, role: "student" | "faculty") => void;
}

/* ─── Sections Grid ─── */
const allSections = [
  "A1", "A2", "B1", "B2", "C1", "C2", "D1", "D2",
  "E1", "E2", "F1", "F2", "G1", "G2", "H1", "H2",
  "I1", "I2", "J1", "J2", "K1", "K2", "L1", "L2",
  "M1", "M2", "N1", "N2", "O1", "O2", "P1", "P2",
  "Q1", "R1", "S1", "T1",
];

const branches = [
  "CSE Core",
  "AI & ML",
  "Data Science",
  "Cyber Security",
  "Cloud Computing",
  "SE",
  "IT",
  "ECE",
];

/* ─── SRM Email Validation ─── */
const SRM_DOMAIN = "@srmist.edu.in";

function validateSrmEmail(email: string): string | null {
  if (!email) return null; // Don't show error on empty
  if (!email.endsWith(SRM_DOMAIN)) {
    return `Email must end with ${SRM_DOMAIN}`;
  }
  const localPart = email.slice(0, -SRM_DOMAIN.length);
  if (localPart.length === 0) {
    return "Please enter a valid email address";
  }
  return null;
}

/* ─── Section Picker Pop-up ─── */
function SectionPicker({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (s: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="absolute left-0 right-0 top-full mt-2 z-50
        bg-white dark:bg-[#111115] backdrop-blur-3xl
        border border-slate-200 dark:border-[#27272a]
        shadow-lg dark:shadow-glass
        rounded-xl p-3 max-h-52 overflow-y-auto"
    >
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5">
        {allSections.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onChange(s);
              onClose();
            }}
            className={`px-2 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150
              ${
                value === s
                  ? "bg-brand-blue text-white border-brand-blue shadow-glow-blue/30"
                  : "bg-slate-100 dark:bg-slate-700/30 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600/30 hover:bg-slate-200 dark:hover:bg-slate-600/40"
              }`}
          >
            {s}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Password Input with Eye Toggle ─── */
function PasswordInput({
  placeholder,
  value,
  onChange,
  autoComplete = "current-password",
  name,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  name?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        name={name}
        id={name}
        readOnly={isReadOnly}
        onFocus={() => setIsReadOnly(false)}
        required
        className="glass-input pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/* ═══════════ AuthModal ═══════════ */
export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [portal, setPortal] = useState<"student" | "faculty">("student");
  const [mode, setMode] = useState<"login" | "register">("login");

  /* Student fields */
  const [studentName, setStudentName] = useState("");
  const [raNumber, setRaNumber] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentEmailError, setStudentEmailError] = useState<string | null>(null);
  const [branch, setBranch] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentConfirm, setStudentConfirm] = useState("");
  const [studentLoginId, setStudentLoginId] = useState("");
  const [studentLoginPw, setStudentLoginPw] = useState("");

  /* Faculty fields */
  const [facultyName, setFacultyName] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [facultyEmail, setFacultyEmail] = useState("");
  const [facultyEmailError, setFacultyEmailError] = useState<string | null>(null);
  const [facultySection, setFacultySection] = useState("");
  const [facultyPassword, setFacultyPassword] = useState("");
  const [facultyConfirm, setFacultyConfirm] = useState("");
  const [facultyLoginId, setFacultyLoginId] = useState("");
  const [facultyLoginPw, setFacultyLoginPw] = useState("");

  /* General error banner state */
  const [authError, setAuthError] = useState<string | null>(null);

  /* Section picker visibility */
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [showFacultyPicker, setShowFacultyPicker] = useState(false);

  const resetAllFields = () => {
    setStudentName("");
    setRaNumber("");
    setStudentEmail("");
    setStudentEmailError(null);
    setBranch("");
    setStudentSection("");
    setStudentPassword("");
    setStudentConfirm("");
    setStudentLoginId("");
    setStudentLoginPw("");

    setFacultyName("");
    setFacultyId("");
    setFacultyEmail("");
    setFacultyEmailError(null);
    setFacultySection("");
    setFacultyPassword("");
    setFacultyConfirm("");
    setFacultyLoginId("");
    setFacultyLoginPw("");

    setAuthError(null);
  };

  /* Scroll Lock & Reset on close */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      setMode("login");
      resetAllFields();
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
    };
  }, [isOpen]);

  /* ── Desktop overlay spring ── */
  const desktopModalVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } },
  };

  /* ── Mobile slide up ── */
  const mobileModalVariants = {
    hidden: { y: "100%" },
    visible: {
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { y: "100%", transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm"
          style={{ pointerEvents: isOpen ? "auto" : "none" }}
        >
          {/* ── Mobile: full screen slide up ── */}
          <motion.div
            variants={mobileModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden w-full h-full bg-white dark:bg-[#09090b] overflow-y-auto"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-slate-200 dark:border-[#27272a]/50">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Welcome to NexaGrade
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-4 py-6">
              {authError && (
                <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold">
                  {authError}
                </div>
              )}
              <ModalContent
                portal={portal}
                setPortal={setPortal}
                mode={mode}
                setMode={setMode}
                authError={authError}
                setAuthError={setAuthError}
                onClose={onClose}
                onLoginSuccess={onLoginSuccess}
                resetAllFields={resetAllFields}
                studentName={studentName}
                setStudentName={setStudentName}
                raNumber={raNumber}
                setRaNumber={setRaNumber}
                studentEmail={studentEmail}
                setStudentEmail={setStudentEmail}
                studentEmailError={studentEmailError}
                setStudentEmailError={setStudentEmailError}
                branch={branch}
                setBranch={setBranch}
                studentSection={studentSection}
                setStudentSection={setStudentSection}
                studentPassword={studentPassword}
                setStudentPassword={setStudentPassword}
                studentConfirm={studentConfirm}
                setStudentConfirm={setStudentConfirm}
                studentLoginId={studentLoginId}
                setStudentLoginId={setStudentLoginId}
                studentLoginPw={studentLoginPw}
                setStudentLoginPw={setStudentLoginPw}
                facultyName={facultyName}
                setFacultyName={setFacultyName}
                facultyId={facultyId}
                setFacultyId={setFacultyId}
                facultyEmail={facultyEmail}
                setFacultyEmail={setFacultyEmail}
                facultyEmailError={facultyEmailError}
                setFacultyEmailError={setFacultyEmailError}
                facultySection={facultySection}
                setFacultySection={setFacultySection}
                facultyPassword={facultyPassword}
                setFacultyPassword={setFacultyPassword}
                facultyConfirm={facultyConfirm}
                setFacultyConfirm={setFacultyConfirm}
                facultyLoginId={facultyLoginId}
                setFacultyLoginId={setFacultyLoginId}
                facultyLoginPw={facultyLoginPw}
                setFacultyLoginPw={setFacultyLoginPw}
                showStudentPicker={showStudentPicker}
                setShowStudentPicker={setShowStudentPicker}
                showFacultyPicker={showFacultyPicker}
                setShowFacultyPicker={setShowFacultyPicker}
              />
            </div>
          </motion.div>

          {/* ── Desktop: centered floating modal ── */}
          <motion.div
            variants={desktopModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="hidden md:block w-full max-w-2xl mx-4
              bg-white dark:bg-[#111115] backdrop-blur-3xl
              border border-slate-200 dark:border-[#27272a]
              shadow-lg dark:shadow-glass
              rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome to NexaGrade
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="px-6 pb-6">
              {authError && (
                <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-500 text-xs font-semibold">
                  {authError}
                </div>
              )}
              <ModalContent
                portal={portal}
                setPortal={setPortal}
                mode={mode}
                setMode={setMode}
                authError={authError}
                setAuthError={setAuthError}
                onClose={onClose}
                onLoginSuccess={onLoginSuccess}
                resetAllFields={resetAllFields}
                studentName={studentName}
                setStudentName={setStudentName}
                raNumber={raNumber}
                setRaNumber={setRaNumber}
                studentEmail={studentEmail}
                setStudentEmail={setStudentEmail}
                studentEmailError={studentEmailError}
                setStudentEmailError={setStudentEmailError}
                branch={branch}
                setBranch={setBranch}
                studentSection={studentSection}
                setStudentSection={setStudentSection}
                studentPassword={studentPassword}
                setStudentPassword={setStudentPassword}
                studentConfirm={studentConfirm}
                setStudentConfirm={setStudentConfirm}
                studentLoginId={studentLoginId}
                setStudentLoginId={setStudentLoginId}
                studentLoginPw={studentLoginPw}
                setStudentLoginPw={setStudentLoginPw}
                facultyName={facultyName}
                setFacultyName={setFacultyName}
                facultyId={facultyId}
                setFacultyId={setFacultyId}
                facultyEmail={facultyEmail}
                setFacultyEmail={setFacultyEmail}
                facultyEmailError={facultyEmailError}
                setFacultyEmailError={setFacultyEmailError}
                facultySection={facultySection}
                setFacultySection={setFacultySection}
                facultyPassword={facultyPassword}
                setFacultyPassword={setFacultyPassword}
                facultyConfirm={facultyConfirm}
                setFacultyConfirm={setFacultyConfirm}
                facultyLoginId={facultyLoginId}
                setFacultyLoginId={setFacultyLoginId}
                facultyLoginPw={facultyLoginPw}
                setFacultyLoginPw={setFacultyLoginPw}
                showStudentPicker={showStudentPicker}
                setShowStudentPicker={setShowStudentPicker}
                showFacultyPicker={showFacultyPicker}
                setShowFacultyPicker={setShowFacultyPicker}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════ Modal Inner Content ═══════════ */
interface ModalContentProps {
  portal: "student" | "faculty";
  setPortal: (p: "student" | "faculty") => void;
  mode: "login" | "register";
  setMode: (m: "login" | "register") => void;
  authError: string | null;
  setAuthError: (e: string | null) => void;
  onClose: () => void;
  onLoginSuccess: (user: any, role: "student" | "faculty") => void;
  resetAllFields: () => void;
  studentName: string;
  setStudentName: (v: string) => void;
  raNumber: string;
  setRaNumber: (v: string) => void;
  studentEmail: string;
  setStudentEmail: (v: string) => void;
  studentEmailError: string | null;
  setStudentEmailError: (v: string | null) => void;
  branch: string;
  setBranch: (v: string) => void;
  studentSection: string;
  setStudentSection: (v: string) => void;
  studentPassword: string;
  setStudentPassword: (v: string) => void;
  studentConfirm: string;
  setStudentConfirm: (v: string) => void;
  studentLoginId: string;
  setStudentLoginId: (v: string) => void;
  studentLoginPw: string;
  setStudentLoginPw: (v: string) => void;
  facultyName: string;
  setFacultyName: (v: string) => void;
  facultyId: string;
  setFacultyId: (v: string) => void;
  facultyEmail: string;
  setFacultyEmail: (v: string) => void;
  facultyEmailError: string | null;
  setFacultyEmailError: (v: string | null) => void;
  facultySection: string;
  setFacultySection: (v: string) => void;
  facultyPassword: string;
  setFacultyPassword: (v: string) => void;
  facultyConfirm: string;
  setFacultyConfirm: (v: string) => void;
  facultyLoginId: string;
  setFacultyLoginId: (v: string) => void;
  facultyLoginPw: string;
  setFacultyLoginPw: (v: string) => void;
  showStudentPicker: boolean;
  setShowStudentPicker: (v: boolean) => void;
  showFacultyPicker: boolean;
  setShowFacultyPicker: (v: boolean) => void;
}

function ModalContent(props: ModalContentProps) {
  const {
    portal, setPortal,
    mode, setMode,
    authError, setAuthError,
    onClose, onLoginSuccess, resetAllFields,
    studentName, setStudentName,
    raNumber, setRaNumber,
    studentEmail, setStudentEmail,
    studentEmailError, setStudentEmailError,
    branch, setBranch,
    studentSection, setStudentSection,
    studentPassword, setStudentPassword,
    studentConfirm, setStudentConfirm,
    studentLoginId, setStudentLoginId,
    studentLoginPw, setStudentLoginPw,
    facultyName, setFacultyName,
    facultyId, setFacultyId,
    facultyEmail, setFacultyEmail,
    facultyEmailError, setFacultyEmailError,
    facultySection, setFacultySection,
    facultyPassword, setFacultyPassword,
    facultyConfirm, setFacultyConfirm,
    facultyLoginId, setFacultyLoginId,
    facultyLoginPw, setFacultyLoginPw,
    showStudentPicker, setShowStudentPicker,
    showFacultyPicker, setShowFacultyPicker,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(true);

  /* ── Student Register submit handler ── */
  const handleStudentRegister = async () => {
    setAuthError(null);
    if (!studentName || !raNumber || !studentEmail || !branch || !studentSection || !studentPassword) {
      setAuthError("Please fill in all fields to create a student account.");
      return;
    }
    const emailErr = validateSrmEmail(studentEmail);
    setStudentEmailError(emailErr);
    if (emailErr) return;
    if (studentPassword !== studentConfirm) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          raNumber,
          name: studentName,
          email: studentEmail,
          branch,
          section: studentSection,
          password: studentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed.");
        return;
      }

      onLoginSuccess(data.user, "student");
      resetAllFields();
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      onClose();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Faculty Register submit handler ── */
  const handleFacultyRegister = async () => {
    setAuthError(null);
    if (!facultyName || !facultyId || !facultyEmail || !facultySection || !facultyPassword) {
      setAuthError("Please fill in all fields to create a faculty account.");
      return;
    }
    const emailErr = validateSrmEmail(facultyEmail);
    setFacultyEmailError(emailErr);
    if (emailErr) return;
    if (facultyPassword !== facultyConfirm) {
      setAuthError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "faculty",
          facultyId,
          name: facultyName,
          email: facultyEmail,
          sectionInCharge: facultySection,
          password: facultyPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Registration failed.");
        return;
      }

      onLoginSuccess(data.user, "faculty");
      resetAllFields();
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      onClose();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Student Login submit handler ── */
  const handleStudentLogin = async () => {
    setAuthError(null);
    if (!studentLoginId || !studentLoginPw) {
      setAuthError("Please enter your RA Number/Email and Password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "student",
          identifier: studentLoginId,
          password: studentLoginPw,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid credentials.");
        return;
      }

      onLoginSuccess(data.user, "student");
      resetAllFields();
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      onClose();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Faculty Login submit handler ── */
  const handleFacultyLogin = async () => {
    setAuthError(null);
    if (!facultyLoginId || !facultyLoginPw) {
      setAuthError("Please enter your Faculty ID/Email and Password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "faculty",
          identifier: facultyLoginId,
          password: facultyLoginPw,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Invalid credentials.");
        return;
      }

      onLoginSuccess(data.user, "faculty");
      resetAllFields();
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      onClose();
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Portal Tabs ── */}
      <div className="relative flex w-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-[#27272a]/50 rounded-full p-1">
        {(["student", "faculty"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPortal(p);
              setAuthError(null);
              resetAllFields();
            }}
            className={`relative flex-1 py-2.5 text-sm font-semibold z-10 transition-colors duration-200 rounded-full ${
              portal === p
                ? "text-white dark:text-black"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            {portal === p && (
              <motion.div
                layoutId="auth-portal-pill"
                className="absolute inset-0 bg-slate-900 dark:bg-amber-500 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              {p === "student" ? "Student Portal" : "Faculty Portal"}
            </span>
          </button>
        ))}
      </div>

      {/* ── Mode Toggle: Login / Register ── */}
      <div className="flex items-center justify-center gap-1 text-sm">
        <button
          onClick={() => {
            setMode("login");
            setAuthError(null);
            resetAllFields();
          }}
          className={`px-4 py-1.5 rounded-lg font-medium transition-colors border ${
            mode === "login"
              ? "bg-slate-100 text-slate-900 border-slate-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setMode("register");
            setAuthError(null);
            resetAllFields();
          }}
          className={`px-4 py-1.5 rounded-lg font-medium transition-colors border ${
            mode === "register"
              ? "bg-slate-100 text-slate-900 border-slate-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Register
        </button>
      </div>

      {/* ── Forms ── */}
      <AnimatePresence mode="wait">
        {portal === "student" ? (
          <motion.div
            key={`student-${mode}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {mode === "register" ? (
              /* ── Student Registration ── */
              <>
                <div>
                  <label className="label-text">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="glass-input"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="label-text">RA Number</label>
                  <input
                    type="text"
                    placeholder="RA2411..."
                    value={raNumber}
                    onChange={(e) => setRaNumber(e.target.value)}
                    className="glass-input"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="label-text">Official SRM Email ID</label>
                  <input
                    type="email"
                    placeholder="e.g. name@srmist.edu.in"
                    value={studentEmail}
                    onChange={(e) => {
                      setStudentEmail(e.target.value);
                      if (studentEmailError) setStudentEmailError(null);
                    }}
                    className={`glass-input ${
                      studentEmailError
                        ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                        : ""
                    }`}
                    autoComplete="off"
                  />
                  {studentEmailError && (
                    <p className="text-red-500 text-xs mt-1 font-medium">
                      {studentEmailError}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-text">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="glass-select focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="" className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b} value={b} className="bg-black text-white dark:bg-slate-950 dark:text-slate-50">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="label-text">Section</label>
                  <button
                    type="button"
                    onClick={() => setShowStudentPicker(!showStudentPicker)}
                    className="glass-input text-left"
                  >
                    {studentSection || (
                      <span className="text-slate-400 dark:text-slate-500">
                        Select Section
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showStudentPicker && (
                      <SectionPicker
                        value={studentSection}
                        onChange={setStudentSection}
                        onClose={() => setShowStudentPicker(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Password</label>
                    <PasswordInput
                      placeholder="Create password"
                      value={studentPassword}
                      onChange={setStudentPassword}
                      autoComplete="new-password"
                      name="new-password"
                    />
                  </div>
                  <div>
                    <label className="label-text">Confirm Password</label>
                    <PasswordInput
                      placeholder="Confirm password"
                      value={studentConfirm}
                      onChange={setStudentConfirm}
                      autoComplete="new-password"
                      name="confirm-password"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStudentRegister}
                  className="w-full py-3 mt-2 rounded-xl font-bold transition-all duration-300
                    bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                    dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black"
                >
                  Create Student Account
                </motion.button>
              </>
            ) : (
              /* ── Student Login ── */
              <>
                <div>
                  <label className="label-text">RA Number</label>
                  <input
                    type="text"
                    placeholder="RA2411..."
                    value={studentLoginId}
                    onChange={(e) => setStudentLoginId(e.target.value)}
                    className="glass-input"
                    autoComplete="off"
                    readOnly={isReadOnly}
                    onFocus={() => setIsReadOnly(false)}
                    name="auth_identifier_field_student"
                    id="auth_identifier_field_student"
                  />
                </div>
                <div>
                  <label className="label-text">Password</label>
                  <PasswordInput
                    placeholder="Enter your password"
                    value={studentLoginPw}
                    onChange={setStudentLoginPw}
                    autoComplete="current-password"
                    name="secure_pass_key_student"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStudentLogin}
                  className="w-full py-3 mt-2 rounded-xl font-bold transition-all duration-300
                    bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                    dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black"
                >
                  Login as Student
                </motion.button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`faculty-${mode}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {mode === "register" ? (
              /* ── Faculty Registration ── */
              <>
                <div>
                  <label className="label-text">Faculty Name</label>
                  <input
                    type="text"
                    placeholder="Dr. / Prof. Full Name"
                    value={facultyName}
                    onChange={(e) => setFacultyName(e.target.value)}
                    className="glass-input"
                    autoComplete="off"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Faculty ID</label>
                    <input
                      type="text"
                      placeholder="e.g. 12345"
                      value={facultyId}
                      onChange={(e) => setFacultyId(e.target.value)}
                      className="glass-input"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label className="label-text">Official SRM Email</label>
                    <input
                      type="email"
                      placeholder="e.g. name@srmist.edu.in"
                      value={facultyEmail}
                      onChange={(e) => {
                        setFacultyEmail(e.target.value);
                        if (facultyEmailError) setFacultyEmailError(null);
                      }}
                      className={`glass-input ${
                        facultyEmailError
                          ? "border-red-500 focus:ring-red-500/50 focus:border-red-500"
                          : ""
                      }`}
                    />
                    {facultyEmailError && (
                      <p className="text-red-500 text-xs mt-1 font-medium">
                        {facultyEmailError}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <label className="label-text">Section In-Charge</label>
                  <button
                    type="button"
                    onClick={() => setShowFacultyPicker(!showFacultyPicker)}
                    className="glass-input text-left"
                  >
                    {facultySection || (
                      <span className="text-slate-400 dark:text-slate-500">
                        Select Section
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showFacultyPicker && (
                      <SectionPicker
                        value={facultySection}
                        onChange={setFacultySection}
                        onClose={() => setShowFacultyPicker(false)}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Password</label>
                    <PasswordInput
                      placeholder="Create password"
                      value={facultyPassword}
                      onChange={setFacultyPassword}
                      autoComplete="new-password"
                      name="new-password"
                    />
                  </div>
                  <div>
                    <label className="label-text">Confirm Password</label>
                    <PasswordInput
                      placeholder="Confirm password"
                      value={facultyConfirm}
                      onChange={setFacultyConfirm}
                      autoComplete="new-password"
                      name="confirm-password"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFacultyRegister}
                  className="w-full py-3 mt-2 rounded-xl font-bold transition-all duration-300
                    bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                    dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black"
                >
                  Create Faculty Account
                </motion.button>
              </>
            ) : (
              /* ── Faculty Login ── */
              <>
                <div>
                  <label className="label-text">Faculty ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 12345"
                    value={facultyLoginId}
                    onChange={(e) => setFacultyLoginId(e.target.value)}
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="label-text">Password</label>
                  <PasswordInput
                    placeholder="Enter your password"
                    value={facultyLoginPw}
                    onChange={setFacultyLoginPw}
                    autoComplete="current-password"
                    name="password"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFacultyLogin}
                  className="w-full py-3 mt-2 rounded-xl font-bold transition-all duration-300
                    bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white
                    dark:bg-none dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-black"
                >
                  Login as Faculty
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Footnote Banner ── */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-amber-500/5 border border-slate-250 dark:border-amber-500/25 mt-4">
        <Info className="w-4 h-4 text-slate-500 dark:text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Platform handles (LeetCode, Codeforces, CodeChef, HackerRank, GFG,
          AtCoder, etc.) are configured in your profile after first login.
        </p>
      </div>
    </div>
  );
}
