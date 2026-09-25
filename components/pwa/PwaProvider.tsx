"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIos: boolean;
  showIosGuide: boolean;
  setShowIosGuide: (show: boolean) => void;
  installApp: () => Promise<void>;
  showBanner: boolean;
  dismissBanner: () => void;
}

const PwaContext = createContext<PwaContextType>({
  isInstallable: false,
  isInstalled: false,
  isIos: false,
  showIosGuide: false,
  setShowIosGuide: () => {},
  installApp: async () => {},
  showBanner: false,
  dismissBanner: () => {},
});

export const usePwa = () => useContext(PwaContext);

const DISMISS_KEY = "pwa_prompt_dismissed_at";
const DISMISS_DURATION_DAYS = 7;

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Check if banner was dismissed recently
  const checkDismissStatus = useCallback(() => {
    try {
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (!dismissedAt) return false;
      const dismissedTime = parseInt(dismissedAt, 10);
      const daysPassed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      return daysPassed < DISMISS_DURATION_DAYS;
    } catch {
      return false;
    }
  }, []);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    // 1. Detect if already running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios|edgios/.test(userAgent);
    
    if (isIosDevice) {
      setIsIos(true);
      if (isSafari && !checkDismissStatus()) {
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
    }

    // 3. Listen to beforeinstallprompt event (Chrome, Edge, Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);

      if (!checkDismissStatus()) {
        // Show install prompt banner after a short delay
        const timer = setTimeout(() => setShowBanner(true), 2500);
        return () => clearTimeout(timer);
      }
    };

    // 4. Listen to appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowBanner(false);
      setDeferredPrompt(null);
      toast.success("ຕິດຕັ້ງແອັບສຳເລັດແລ້ວ! (Installed Successfully)");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // 5. Register Service Worker
    if ("serviceWorker" in navigator) {
      const basePath = process.env.NODE_ENV === "production" ? "/meeting_notice" : "";
      const swUrl = `${basePath}/sw.js`;
      const swScope = `${basePath}/`;

      navigator.serviceWorker
        .register(swUrl, { scope: swScope })
        .then((registration) => {
          // Check for service worker updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;
            installingWorker.onstatechange = () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available
                console.log("New content is available; please refresh.");
              }
            };
          };
        })
        .catch((error) => {
          console.warn("ServiceWorker registration failed:", error);
        });
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [checkDismissStatus]);

  const installApp = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      toast.info("ແອັບນີ້ຖືກຕິດຕັ້ງແລ້ວ ຫຼື Browser ຂອງທ່ານບໍ່ຮອງຮັບການຕິດຕັ້ງອັດຕະໂນມັດ");
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
        setDeferredPrompt(null);
      } else {
        dismissBanner();
      }
    } catch (err) {
      console.error("Installation failed:", err);
    }
  };

  return (
    <PwaContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIos,
        showIosGuide,
        setShowIosGuide,
        installApp,
        showBanner,
        dismissBanner,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
