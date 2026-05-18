"use client";

import { ChevronDown, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProfileDropdown() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const profileButton = document.querySelector("[data-profile-button]");
      if (profileButton && !profileButton.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [profileOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      // Always redirect even if the request fails
      router.push("/signin");
    }
  };

  const firstName = user?.employee?.first_name || user?.username || "Admin";
  const lastName = user?.employee?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const initial = firstName.charAt(0).toUpperCase() || "A";
  const empimg = user?.employee?.empimg;
  const empCode = user?.employee?.emp_code || user?.username || "";

  return (
    <div className="relative" data-profile-button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setProfileOpen(!profileOpen);
        }}
        aria-label="Profile menu"
        aria-expanded={profileOpen}
        className={cn(
          "flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg transition-all duration-200 hover:shadow-md group border",
          profileOpen ? "bg-white border-white" : "bg-white/10 border-white/20 hover:bg-white/20"
        )}
      >
        <div
          className={cn(
            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shadow-sm transition-colors overflow-hidden",
            profileOpen ? "bg-blue-600 text-white" : "bg-white text-blue-700"
          )}
        >
          {empimg ? (
            <img src={empimg} alt="profile" className="w-full h-full object-cover object-top" />
          ) : (
            initial
          )}
        </div>
        <div className="hidden lg:block text-left">
          <div
            className={cn(
              "text-xs font-semibold leading-none mb-0.5",
              profileOpen ? "text-blue-900" : "text-white"
            )}
          >
            {fullName}
          </div>
          <div
            className={cn(
              "text-xs leading-none",
              profileOpen ? "text-blue-700/80" : "text-white/70"
            )}
          >
            {empCode}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 hidden lg:block transition-transform duration-300",
            profileOpen ? "text-blue-900 rotate-180" : "text-white/70 rotate-0"
          )}
        />
      </button>

      {/* Profile Dropdown Menu */}
      {profileOpen && (
        <div
          className="absolute right-0 mt-3 w-56 rounded-xl shadow-xl overflow-hidden border z-50 backdrop-blur-sm"
          style={{
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))",
            boxShadow: "0 4px 32px rgba(0, 0, 0, 0.12)",
            animation: "slideDown 200ms ease-out",
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b"
            style={{
              background:
                "linear-gradient(135deg, rgb(var(--brand)) 0%, rgb(var(--brand) / 0.8) 100%)",
              borderColor: "rgb(var(--border))",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-md overflow-hidden"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                {empimg ? (
                  <img src={empimg} alt="profile" className="w-full h-full object-cover object-top" />
                ) : (
                  initial
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{fullName}</div>
                <div className="text-xs text-white text-opacity-80">{empCode}</div>
              </div>
            </div>
          </div>

          <div className="py-2">
            {/* Profile Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 group/item"
              style={{ color: "rgb(var(--text-secondary))" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(var(--bg))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={() => {
                setProfileOpen(false);
                router.push("/profile");
              }}
            >
              <User
                className="w-4 h-4 transition-transform group-hover/item:scale-110"
                strokeWidth={2}
              />
              <span className="font-medium">ໂປຣຟາຍ</span>
            </button>

            {/* Divider */}
            <div
              className="h-px my-2"
              style={{ background: "rgb(var(--border))" }}
            />

            {/* Logout Option */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 group/item disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ color: "rgb(var(--danger))" }}
              disabled={loggingOut}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgb(var(--danger) / 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={handleLogout}
            >
              {loggingOut ? (
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <LogOut
                  className="w-4 h-4 transition-transform group-hover/item:scale-110"
                  strokeWidth={2}
                />
              )}
              <span className="font-medium">{loggingOut ? "ກຳລັງອອກລະບົບ..." : "ອອກຈາກລະບົບ"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
