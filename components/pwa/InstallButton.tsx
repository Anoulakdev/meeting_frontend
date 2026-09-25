"use client";

import React from "react";
import { usePwa } from "./PwaProvider";
import { Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InstallButtonProps {
  className?: string;
  variant?: "menu" | "button";
  onInstalled?: () => void;
}

export function InstallButton({ className, variant = "button", onInstalled }: InstallButtonProps) {
  const { isInstalled, isInstallable, isIos, installApp } = usePwa();

  // If running in browser and installable or on iOS Safari
  const canShow = !isInstalled && (isInstallable || isIos);

  if (!canShow && !isInstalled) return null;

  if (isInstalled) {
    if (variant === "menu") {
      return (
        <div
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 text-sm opacity-60 cursor-default",
            className
          )}
          style={{ color: "rgb(var(--text-secondary))" }}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="font-medium">ແອັບຖືກຕິດຕັ້ງແລ້ວ</span>
        </div>
      );
    }
    return null;
  }

  const handleClick = async () => {
    await installApp();
    if (onInstalled) onInstalled();
  };

  if (variant === "menu") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150 group/item text-blue-600 dark:text-blue-400 font-medium",
          className
        )}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgb(var(--bg))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Download className="w-4 h-4 transition-transform group-hover/item:scale-110" />
        <span>ຕິດຕັ້ງແອັບ (Install App)</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm",
        className
      )}
    >
      <Download className="w-3.5 h-3.5" />
      <span>ຕິດຕັ້ງແອັບ</span>
    </button>
  );
}
