"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/signin' || pathname === '/signup' || pathname === '/resetpassword';

  return (
    <div className="min-h-screen flex flex-col relative z-0">
      {!isAuthPage && <Navbar />}
      <main className={`flex-1 ${!isAuthPage ? 'pt-16' : ''}`}>
        {children}
      </main>
    </div>
  );
}
