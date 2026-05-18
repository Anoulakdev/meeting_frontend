"use client";

import Link from "next/link";
import { Home, ArrowLeft, ShieldAlert } from "lucide-react";

export function UnauthorizedView() {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "rgb(var(--bg))" }}
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glowing Orbs */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.07] animate-pulse"
          style={{ background: "radial-gradient(circle, #ef4444, transparent 70%)", animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.05] animate-pulse"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)", animationDuration: "12s" }}
        />

        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
          style={{
            backgroundImage: `linear-gradient(rgb(var(--text-primary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--text-primary)) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            transform: "perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
            transformOrigin: "top center",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center justify-center mx-auto">
        <div className="flex flex-col items-center text-center relative">

          <div className="relative mb-6 group cursor-default">
            {/* 403 Text */}
            <h1
              className="text-[9rem] lg:text-[13rem] font-black leading-none tracking-tighter"
              style={{
                fontFamily: "var(--font-display)",
                background: `linear-gradient(135deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 20px 40px rgba(239, 68, 68, 0.2)) text-shadow-sm"
              }}
            >
              403
            </h1>
          </div>

          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 tracking-wide shadow-sm"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#ef4444",
            }}
          >
            <ShieldAlert className="w-4 h-4" />
            ACCESS DENIED
          </div>

          <h2
            className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ບໍ່ມີສິດເຂົ້າເຖິງ
          </h2>
          <p className="text-lg mb-10 max-w-md leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>
            ຂໍອະໄພ, ທ່ານບໍ່ມີສິດໃນການເຂົ້າເຖິງໜ້ານີ້. ກະລຸນາກັບຄືນໜ້າຫຼັກ ຫຼື ຕິດຕໍ່ຜູ້ເບິ່ງແຍງລະບົບຖ້າທ່ານຄິດວ່ານີ້ແມ່ນຂໍ້ຜິດພາດ.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold border transition-all duration-300"
              style={{
                background: "rgb(var(--card))",
                borderColor: "rgb(var(--border))",
                color: "rgb(var(--text-secondary))",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(var(--text-primary))";
                (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-primary))";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgb(var(--border))";
                (e.currentTarget as HTMLButtonElement).style.color = "rgb(var(--text-secondary))";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              ຍ້ອນກັບ
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)",
              }}
            >
              <Home className="w-5 h-5" />
              ກັບຄືນໜ້າຫຼັກ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
