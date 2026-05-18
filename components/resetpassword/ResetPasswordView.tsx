"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Zap, CheckCircle2, Lock } from "lucide-react";

export default function ResetPasswordView() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] py-12 px-4 sm:px-6 overflow-hidden">
      <div 
        className="w-full max-w-[1000px] flex rounded-[2rem] overflow-hidden border shadow-2xl relative"
        style={{
          background: "rgb(var(--card))",
          borderColor: "rgba(var(--border), 0.8)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Visual Side */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-600 to-[rgb(var(--brand))] opacity-90" />
          <div className="absolute inset-0 z-0 mix-blend-overlay opacity-30" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Cg/%3E%3C/svg%3E')" }} />
          
          <div className="relative z-10 flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              AdminOS
            </span>
          </div>

          <div className="relative z-10 text-white">
            <h2 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Secure your account.
            </h2>
            <p className="text-lg text-white/80 font-medium max-w-md">
              We'll help you get back to managing your dashboard in no time. Fast and secure recovery.
            </p>
          </div>
          
          <div className="relative z-10 mt-12 flex">
             <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-max max-w-sm flex items-start gap-4 text-left">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Enterprise Security</h3>
                  <p className="text-white/70 text-sm">Your data is protected with industry-standard encryption protocols.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[rgb(var(--card))]">
          <div className="w-full max-w-sm mx-auto">
            {!success ? (
              <>
                <div className="mb-10 text-center lg:text-left">
                  <h1 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
                    Reset Password
                  </h1>
                  <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-[rgb(var(--brand))] transition-colors" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                        style={{ border: "1.5px solid rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}
                        onFocus={(e) => e.target.style.borderColor = "rgb(var(--brand))"}
                        onBlur={(e) => e.target.style.borderColor = "rgba(var(--border), 1)"}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                    style={{ background: "rgb(var(--brand))", boxShadow: email && !loading ? "0 8px 20px -4px rgba(var(--brand), 0.4)" : "none" }}
                  >
                    {loading ? (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                    ) : (
                      <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl font-extrabold mb-3 tracking-tight" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
                  Check your inbox
                </h1>
                <p className="text-sm font-medium mb-8" style={{ color: "rgb(var(--text-secondary))" }}>
                  We've sent a password reset link to <br/>
                  <span className="font-bold" style={{ color: "rgb(var(--text-primary))" }}>{email}</span>
                </p>
                <button
                  onClick={() => { setSuccess(false); setEmail(""); }}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all border hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ borderColor: "rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}
                >
                  Try another email
                </button>
              </div>
            )}

            <div className="mt-8 text-center">
              <Link href="/signin" className="text-sm font-bold hover:underline" style={{ color: "rgb(var(--brand))" }}>
                ← Back to Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
