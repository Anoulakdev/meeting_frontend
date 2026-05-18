"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Zap, ArrowRight, Check } from "lucide-react";

const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const Chrome = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="21.17" x2="12" y1="8" y2="8" /><line x1="3.95" x2="8.54" y1="6.06" y2="14" /><line x1="10.88" x2="15.46" y1="21.94" y2="14" /></svg>
);

import { signUpSchema } from "@/schemas/auth";

const PASSWORD_RULES = [
  { label: "8+ chars", test: (p: string) => p.length >= 8 },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { label: "Special char", test: (p: string) => /[^A-Za-z0-9]/.test(p) }
];

export default function SignUpView() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    const result = signUpSchema.safeParse({ firstName, lastName, email, password });
    if (!result.success) {
      const fieldErrors: { firstName?: string; lastName?: string; email?: string; password?: string } = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    // TODO: implement actual sign-up logic here
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/dashboard";
    }, 1800);
  };

  const strengthScore = PASSWORD_RULES.filter(r => r.test(password)).length;
  const strengthColor = ["rgb(var(--danger))", "rgb(var(--warning))", "rgb(var(--warning))", "rgb(var(--success))"][strengthScore];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-6rem)] py-12 px-4 sm:px-6 overflow-hidden">
      <div
        className="w-full max-w-[1000px] flex flex-row-reverse rounded-[2rem] overflow-hidden border shadow-2xl relative"
        style={{
          background: "rgb(var(--card))",
          borderColor: "rgba(var(--border), 0.8)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        }}
      >
        {/* Visual Side (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-bl from-teal-500 to-[rgb(var(--brand))] opacity-90" />
          <div className="absolute inset-0 z-0 mix-blend-overlay opacity-30" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.4\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"3\"/%3E%3Cg/%3E%3C/svg%3E')" }} />

          <div className="relative z-10 flex items-center gap-2 mb-8 justify-end">
            <span className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Admin<span className="text-white/70">OS</span>
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="relative z-10 text-white text-right">
            <h2 className="text-4xl font-extrabold mb-4 leading-tight tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              Start building your next big idea.
            </h2>
            <p className="text-lg text-white/80 font-medium ml-auto max-w-sm">
              Create an account in seconds and unlock powerful tools for your business.
            </p>
          </div>

          <div className="relative z-10 mt-12 flex flex-col items-end gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-max max-w-xs text-left">
              <p className="text-white text-sm font-medium mb-2">"AdminOS completely changed how our team manages data."</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/30"></div>
                <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Sarah J. — CEO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-[rgb(var(--card))]">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold mb-2 tracking-tight" style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}>
                Create account
              </h1>
              <p className="text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                Sign up for free. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>First Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-gray-400 group-focus-within:text-[rgb(var(--brand))] transition-colors" />
                    </div>
                    <input type="text" placeholder="John" required value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
                      }}
                      className="block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                      style={{ border: errors.firstName ? "1.5px solid rgb(var(--danger))" : "1.5px solid rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}
                      onFocus={(e) => { if (!errors.firstName) e.target.style.borderColor = "rgb(var(--brand))" }}
                      onBlur={(e) => { if (!errors.firstName) e.target.style.borderColor = "rgba(var(--border), 1)" }}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs mt-1" style={{ color: "rgb(var(--danger))" }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>Last Name</label>
                  <input type="text" placeholder="Doe" required value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: undefined }));
                    }}
                    className="block w-full px-3 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                    style={{ border: errors.lastName ? "1.5px solid rgb(var(--danger))" : "1.5px solid rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}
                    onFocus={(e) => { if (!errors.lastName) e.target.style.borderColor = "rgb(var(--brand))" }}
                    onBlur={(e) => { if (!errors.lastName) e.target.style.borderColor = "rgba(var(--border), 1)" }}
                  />
                  {errors.lastName && <p className="text-xs mt-1" style={{ color: "rgb(var(--danger))" }}>{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-gray-400 group-focus-within:text-[rgb(var(--brand))] transition-colors" />
                  </div>
                  <input type="email" placeholder="you@example.com" required value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className="block w-full pl-10 pr-3 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                    style={{ border: errors.email ? "1.5px solid rgb(var(--danger))" : "1.5px solid rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}
                    onFocus={(e) => { if (!errors.email) e.target.style.borderColor = "rgb(var(--brand))" }}
                    onBlur={(e) => { if (!errors.email) e.target.style.borderColor = "rgba(var(--border), 1)" }}
                  />
                </div>
                {errors.email && <p className="text-xs mt-1" style={{ color: "rgb(var(--danger))" }}>{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "rgb(var(--text-secondary))" }}>Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-gray-400 group-focus-within:text-[rgb(var(--brand))] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                    style={{ border: errors.password ? "1.5px solid rgb(var(--danger))" : "1.5px solid rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}
                    onFocus={(e) => { if (!errors.password) e.target.style.borderColor = "rgb(var(--brand))" }}
                    onBlur={(e) => { if (!errors.password) e.target.style.borderColor = "rgba(var(--border), 1)" }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center" style={{ color: "rgb(var(--text-secondary))" }}>
                    {showPassword ? <EyeOff className="w-4 h-4 hover:text-[rgb(var(--text-primary))] transition-colors" /> : <Eye className="w-4 h-4 hover:text-[rgb(var(--text-primary))] transition-colors" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs mt-1" style={{ color: "rgb(var(--danger))" }}>{errors.password}</p>}

                {/* Strength Indicator */}
                {password && (
                  <div className="mt-3">
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{ background: i <= strengthScore ? strengthColor : "rgba(var(--border), 1)" }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {PASSWORD_RULES.map(r => (
                        <div key={r.label} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5" strokeWidth={3} style={{ color: r.test(password) ? "rgb(var(--success))" : "rgba(var(--border), 1)" }} />
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: r.test(password) ? "rgb(var(--success))" : "rgb(var(--text-secondary))" }}>
                            {r.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer group mt-4">
                <div className="relative flex items-center justify-center w-5 h-5 shrink-0 mt-0.5">
                  <input type="checkbox" className="peer sr-only" checked={agreed} onChange={() => setAgreed(!agreed)} />
                  <div className="w-5 h-5 rounded border-2 transition-all peer-checked:bg-[rgb(var(--brand))] peer-checked:border-[rgb(var(--brand))] group-hover:border-[rgb(var(--brand))]" style={{ borderColor: "rgba(var(--border), 1)" }} />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-xs leading-relaxed font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" onClick={(e) => e.preventDefault()} className="font-bold hover:underline" style={{ color: "rgb(var(--brand))" }}>Terms</Link>
                  {" "}and{" "}
                  <Link href="/privacy" onClick={(e) => e.preventDefault()} className="font-bold hover:underline" style={{ color: "rgb(var(--brand))" }}>Privacy Policy</Link>.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
                style={{ background: "rgb(var(--brand))", boxShadow: agreed && !loading ? "0 8px 20px -4px rgba(var(--brand), 0.4)" : "none" }}
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex-1 h-[1px]" style={{ background: "rgba(var(--border), 1)" }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgb(var(--text-secondary))" }}>Or</span>
              <div className="flex-1 h-[1px]" style={{ background: "rgba(var(--border), 1)" }} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}>
                <Github className="w-4 h-4" /> GitHub
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-bold transition-all hover:bg-black/5 dark:hover:bg-white/5" style={{ borderColor: "rgba(var(--border), 1)", color: "rgb(var(--text-primary))" }}>
                <Chrome className="w-4 h-4" /> Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm font-medium" style={{ color: "rgb(var(--text-secondary))" }}>
              Already have an account?{" "}
              <Link href="/signin" className="font-bold hover:underline" style={{ color: "rgb(var(--brand))" }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
