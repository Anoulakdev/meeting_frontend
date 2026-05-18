"use client";

import Link from "next/link";
import { Zap, Menu, X } from "lucide-react";
import { useState } from "react";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { SearchBox } from "./SearchBox";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(29, 78, 216) 100%)", /* Deep Blue */
          boxShadow: "0 10px 40px -10px rgba(29, 78, 216, 0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="max-w-screen-2xl mx-auto h-full px-4 md:px-6 flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-lg">
              <Zap className="w-4 h-4 text-blue-700" strokeWidth={2.5} />
            </div>
            <span
              className="text-lg font-bold hidden sm:block text-white"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
              }}
            >
              ລະບົບ<span className="text-blue-300">ແຈ້ງເຕືອນປະຊຸມ</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <DesktopNav />

          {/* Right Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* <SearchBox /> */}
            {/* <NotificationsDropdown /> */}
            <ThemeToggle />
            <ProfileDropdown />

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white shadow-sm"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <MobileNav mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      </header>

      {/* Global CSS for Animations */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 200ms ease-out forwards;
        }
      `}</style>
    </>
  );
}
