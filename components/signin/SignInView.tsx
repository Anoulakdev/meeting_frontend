"use client";

import { useState, useId, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Sparkles,
  User,
  ShieldCheck,
} from "lucide-react";

import { signInSchema } from "@/schemas/auth";

export default function SignInView() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [focusField, setFocusField] = useState<"username" | "password" | null>(
    null,
  );
  const [shakeKey, setShakeKey] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const id = useId();

  // ── Session check: if a valid token cookie already exists, redirect by role ──
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          const roleId: number = data?.roleId;
          if (roleId === 1) {
            window.location.href = "/dashboard";
          } else if (roleId === 2) {
            window.location.href = "/meetingdoc";
          } else {
            // Role not allowed via browser — show login form normally
            setCheckingSession(false);
          }
          return;
        }
      } catch {
        // Network error — just show login form
      }
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  // Load saved username on mount (password is NOT stored for security)
  useEffect(() => {
    if (checkingSession) return;
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
    usernameRef.current?.focus();
  }, [checkingSession]);

  useEffect(() => {
    if (errors.username || errors.password) setShakeKey((k) => k + 1);
  }, [errors]);

  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signInSchema.safeParse({ username, password });
    if (!result.success) {
      const fieldErrors: { username?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0])
          fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setApiError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.message ?? "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
        setShakeKey((k) => k + 1);
        return;
      }

      // Save username only — password is NEVER stored in localStorage
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      const roleId: number = data?.user?.roleId;

      if (roleId === 1) {
        window.location.href = "/dashboard";
      } else if (roleId === 2) {
        window.location.href = "/meetingdoc";
      } else {
        setApiError(
          "ທ່ານບໍ່ມີສິດເຂົ້າຜ່ານ browser ໃຫ້ທ່ານເຂົ້າຜ່ານ mobile app",
        );
        setShakeKey((k) => k + 1);
      }
    } catch {
      setApiError("ເກີດຂໍ້ຜິດພາດ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
      setShakeKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  // ── While verifying session, show a full-screen spinner ──
  if (checkingSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(-45deg,#dde8ff,#ede8ff,#fce8ff,#e8f0ff)",
          backgroundSize: "400% 400%",
          animation: "mesh-shift 16s ease infinite",
        }}
      >
        <style>{`
          @keyframes mesh-shift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes spin-ring {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ textAlign: "center" }}>
          <svg
            style={{ width: 48, height: 48, animation: "spin-ring 0.9s linear infinite" }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="rgba(99,102,241,0.2)" strokeWidth="4" />
            <path
              d="M4 12a8 8 0 018-8"
              stroke="#6366f1"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <p style={{ marginTop: 14, fontSize: 16, color: "#6366f1", fontWeight: 600 }}>
            ກຳລັງກວດສອບ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes orb-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.08); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes orb-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(0.92); }
          66% { transform: translate(25px, -25px) scale(1.1); }
        }
        @keyframes orb-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 35px) scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 20px 6px rgba(99,102,241,0.7); }
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes grid-drift {
          0% { background-position: 0 0; }
          100% { background-position: 60px 60px; }
        }
        .orb-1 { animation: orb-float-1 10s ease-in-out infinite; }
        .orb-2 { animation: orb-float-2 13s ease-in-out infinite; }
        .orb-3 { animation: orb-float-3 8s ease-in-out infinite; }
        .shimmer-btn {
          background-size: 200% auto;
          background-image: linear-gradient(
            110deg,
            #4f46e5 0%,
            #6366f1 30%,
            #818cf8 50%,
            #6366f1 70%,
            #4f46e5 100%
          );
          animation: shimmer 3s linear infinite;
          transition: filter 0.2s, transform 0.15s;
        }
        .shimmer-btn:hover { filter: brightness(1.12); transform: translateY(-2px); }
        .shimmer-btn:active { transform: translateY(0); }
        .shimmer-btn:disabled { animation: none; opacity: 0.65; }
        .sign-card { animation: slide-up-fade 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .input-glow:focus-within {
          box-shadow: 0 0 0 3px rgba(99,102,241,0.22);
          border-color: rgba(99,102,241,0.7) !important;
        }
        .grid-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C%2Fg%3E%3C/svg%3E");
          animation: grid-drift 8s linear infinite;
        }
        @keyframes mesh-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .page-bg {
          background: linear-gradient(
            -45deg,
            #dde8ff,
            #ede8ff,
            #fce8ff,
            #e8f0ff,
            #e8fff8,
            #fff0e8,
            #e8ecff
          );
          background-size: 600% 600%;
          animation: mesh-shift 16s ease infinite;
        }
        .bg-orb-a {
          position: absolute;
          width: 650px; height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%);
          filter: blur(64px);
          top: -150px; left: -180px;
          animation: orb-float-1 18s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-orb-b {
          position: absolute;
          width: 550px; height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 65%);
          filter: blur(72px);
          bottom: -120px; right: -140px;
          animation: orb-float-2 22s ease-in-out infinite;
          pointer-events: none;
        }
        .bg-orb-c {
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,0.13) 0%, transparent 65%);
          filter: blur(60px);
          top: 40%; right: 5%;
          animation: orb-float-3 26s ease-in-out infinite;
          pointer-events: none;
        }
        .dot-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }
      `}</style>

      <div className="page-bg relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 overflow-hidden">
        <div className="dot-pattern" />
        <div className="bg-orb-a" />
        <div className="bg-orb-b" />
        <div className="bg-orb-c" />
        <div
          className="sign-card w-full max-w-5xl flex rounded-3xl overflow-hidden relative"
          style={{
            boxShadow: "0 32px 80px -16px rgba(79,70,229,0.25), 0 8px 32px rgba(0,0,0,0.12)",
            border: "1px solid rgba(99,102,241,0.18)",
          }}
        >
          {/* ══════════════ Visual / Left Panel ══════════════ */}
          <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
            {/* Deep gradient base */}
            <div className="absolute inset-0"
              style={{
                background: "linear-gradient(145deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)",
              }}
            />
            {/* Grid overlay */}
            <div className="absolute inset-0 grid-bg opacity-40" />

            {/* Floating orbs */}
            <div className="orb-1 absolute top-16 left-16 w-48 h-48 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, transparent 70%)", filter: "blur(18px)" }} />
            <div className="orb-2 absolute bottom-20 right-10 w-56 h-56 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)", filter: "blur(24px)" }} />
            <div className="orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)", filter: "blur(30px)" }} />

            {/* Geometric accent shapes */}
            <div className="absolute top-28 right-16 w-20 h-20 rounded-2xl rotate-[20deg] border border-white/10 bg-white/5 backdrop-blur-sm" />
            <div className="absolute bottom-36 left-10 w-14 h-14 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm" />
            <div className="absolute top-1/2 right-6 w-10 h-10 rounded-lg border border-purple-300/20 bg-purple-400/10 rotate-45" />

            {/* Brand badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg"
                style={{ animation: "badge-glow 3s ease-in-out infinite" }}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-base font-bold text-white tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}>
                  ລະບົບ<span className="text-violet-200">ແຈ້ງເຕືອນ</span>ປະຊຸມ
                </span>
              </div>
            </div>

            {/* Hero text */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full animate-ping"
                    style={{ animation: "pulse-ring 2s ease-out infinite", background: "rgba(167,139,250,0.3)" }} />
                  <Sparkles className="w-4 h-4 text-violet-300 relative z-10" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                  ລັດວິສາຫະກິດໄຟຟ້າລາວ
                </span>
              </div>
              <h2 className="text-4xl font-extrabold mb-5 leading-tight tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}>
                ຈັດການການປະຊຸມ
                <br />
                <span style={{
                  background: "linear-gradient(90deg, #c4b5fd, #93c5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  ຢ່າງສະຫຼາດ
                </span>{" "}ກວ່າເກົ່າ.
              </h2>
              <p className="text-base text-white/60 font-medium leading-relaxed max-w-xs">
                ເຂົ້າຮ່ວມກັບພະນັກງານຫຼາຍພັນຄົນທີ່ໃຊ້ລະບົບນີ້ເພື່ອ
                ຈັດການປະຊຸມຢ່າງມີປະສິດທິພາບ.
              </p>
            </div>

            {/* Stats + Avatars */}
            <div className="relative z-10 flex items-center gap-5">
              <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i}
                    className="w-10 h-10 rounded-full border-2 border-indigo-300/30 bg-white/10 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-lg">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 7}&backgroundColor=transparent`}
                      alt=""
                      className="w-full h-full object-cover opacity-90"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-indigo-300/30 bg-indigo-500/30 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  +100
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════ Form / Right Panel ══════════════ */}
          <div
            className="w-full lg:w-[48%] flex flex-col justify-center p-8 sm:p-12 lg:p-14"
            style={{ background: "rgb(var(--card))" }}
          >
            <div className="w-full max-w-sm mx-auto">

              {/* Mobile brand */}
              <div className="flex items-center gap-3 mb-8 lg:hidden">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md">
                  <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-lg font-bold tracking-tight"
                  style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
                  ລະບົບແຈ້ງເຕືອນ
                </span>
              </div>

              {/* Header */}
              <div className="mb-10">

                <h1 className="text-3xl font-extrabold mb-2 tracking-tight"
                  style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
                  ຍິນດີ{" "}
                  <span style={{
                    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    ຕ້ອນຮັບ
                  </span>
                </h1>
                <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                  ກະລຸນາປ້ອນຂໍ້ມູນຂອງທ່ານເພື່ອເຂົ້າສູ່ລະບົບ
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div>
                  <label
                    htmlFor={`${id}-username`}
                    className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    ຊື່ຜູ້ໃຊ້
                  </label>
                  <div
                    className="relative group input-glow rounded-xl transition-all duration-200"
                    style={{
                      border: errors.username
                        ? "1.5px solid rgb(var(--danger))"
                        : "1.5px solid #d1d5db",
                      background: "#ffffff",
                    }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <User
                        className="w-4 h-4 transition-colors duration-200"
                        style={{
                          color: errors.username
                            ? "rgb(var(--danger))"
                            : focusField === "username"
                              ? "rgb(99,102,241)"
                              : "rgb(var(--text-secondary))",
                        }}
                      />
                    </div>
                    <input
                      id={`${id}-username`}
                      ref={usernameRef}
                      type="text"
                      autoComplete="username"
                      required
                      placeholder="ປ້ອນຊື່ຜູ້ໃຊ້ຂອງທ່ານ"
                      value={username}
                      onFocus={() => setFocusField("username")}
                      onBlur={() => setFocusField(null)}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (errors.username)
                          setErrors((prev) => ({ ...prev, username: undefined }));
                      }}
                      className="block w-full pl-10 pr-3.5 py-3 rounded-xl text-sm outline-none bg-transparent"
                      style={{ color: "#000000" }}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs mt-1.5 font-medium flex items-center gap-1"
                      style={{ color: "rgb(var(--danger))" }}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor={`${id}-password`}
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      ລະຫັດຜ່ານ
                    </label>
                    {/* <Link
                      href="/resetpassword"
                      className="text-xs font-bold transition-all hover:opacity-80 hover:underline"
                      style={{
                        background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      ລືມລະຫັດຜ່ານ?
                    </Link> */}
                  </div>
                  <div
                    className="relative group input-glow rounded-xl transition-all duration-200"
                    style={{
                      border: errors.password
                        ? "1.5px solid rgb(var(--danger))"
                        : "1.5px solid #d1d5db",
                      background: "#ffffff",
                    }}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                      <Lock
                        className="w-4 h-4 transition-colors duration-200"
                        style={{
                          color: errors.password
                            ? "rgb(var(--danger))"
                            : focusField === "password"
                              ? "rgb(99,102,241)"
                              : "rgb(var(--text-secondary))",
                        }}
                      />
                    </div>
                    <input
                      id={`${id}-password`}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onFocus={() => setFocusField("password")}
                      onBlur={() => setFocusField(null)}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      className="block w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none bg-transparent"
                      style={{ color: "#000000" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-10 transition-colors"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 hover:text-indigo-500 transition-colors" />
                      ) : (
                        <Eye className="w-4 h-4 hover:text-indigo-500 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs mt-1.5 font-medium flex items-center gap-1"
                      style={{ color: "rgb(var(--danger))" }}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember me */}
                <label
                  className="flex items-center gap-3 cursor-pointer group w-max"
                  onClick={() => setRememberMe((v) => !v)}
                >
                  <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                    {/* Box */}
                    <div
                      className="w-5 h-5 rounded-lg border-2 transition-all duration-200 shadow-sm"
                      style={{
                        borderColor: rememberMe ? "#6366f1" : "#d1d5db",
                        background: rememberMe
                          ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                          : "#ffffff",
                      }}
                    />
                    {/* Checkmark */}
                    {rememberMe && (
                      <svg
                        className="absolute w-3 h-3 text-white pointer-events-none"
                        viewBox="0 0 14 10"
                        fill="none"
                      >
                        <path
                          d="M1 5L5 9L13 1"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className="text-sm font-medium transition-colors"
                    style={{
                      color: rememberMe
                        ? "rgb(var(--text-primary))"
                        : "rgb(var(--text-secondary))",
                    }}
                  >
                    ຈື່ຂ້ອຍໄວ້
                  </span>
                </label>

                {/* API Error Banner */}
                {apiError && (
                  <div
                    className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1.5px solid rgba(239,68,68,0.35)",
                      color: "rgb(220,38,38)",
                    }}
                  >
                    <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="shimmer-btn w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg mt-1"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      ກຳລັງເຂົ້າລະບົບ...
                    </>
                  ) : (
                    <>
                      ເຂົ້າລະບົບ
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
