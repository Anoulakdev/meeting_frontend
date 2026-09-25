"use client";

import React from "react";
import { usePwa } from "./PwaProvider";
import { Download, X, Share, PlusSquare, Smartphone } from "lucide-react";

export function InstallBanner() {
  const {
    isInstalled,
    showBanner,
    dismissBanner,
    installApp,
    isIos,
    showIosGuide,
    setShowIosGuide,
  } = usePwa();

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Install Prompt Banner */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Install App Notice"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[380px] z-40 animate-slide-up"
          style={{ animation: "slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          <div
            className="p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all"
            style={{
              background: "rgba(15, 23, 42, 0.92)",
              borderColor: "rgba(59, 130, 246, 0.3)",
              boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(37, 99, 235, 0.2)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-md shrink-0 flex items-center justify-center">
                <img
                  src="./icons/icon-192x192.png"
                  alt="App Icon"
                  className="w-full h-full rounded-[10px] object-cover"
                  onError={(e) => {
                    // Fallback to Smartphone icon if image not yet loaded
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white tracking-tight truncate">
                    EDL Meeting Notice
                  </h4>
                  <button
                    onClick={dismissBanner}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors -mr-1 -mt-1"
                    aria-label="ປິດ"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                  ຕິດຕັ້ງແອັບລົງໃນອຸປະກອນ ເພື່ອຄວາມວ່ອງໄວ ແລະ ຮັບການແຈ້ງເຕືອນແບບ Real-time
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={installApp}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ຕິດຕັ້ງແອັບ
                  </button>
                  <button
                    onClick={dismissBanner}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                  >
                    ພາຍຫຼັງ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-white shadow-2xl border relative overflow-hidden"
            style={{
              background: "#0f172a",
              borderColor: "rgba(255, 255, 255, 0.12)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-base">ວິທີຕິດຕັ້ງໃນ iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-4 my-5 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="leading-relaxed">
                  ກົດປຸ່ມ{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-0.5 rounded">
                    <Share className="w-3.5 h-3.5 text-blue-400" /> Share
                  </span>{" "}
                  ຢູ່ແຖບລຸ່ມຂອງ Safari
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="leading-relaxed">
                  ເລື່ອນລົງແລ້ວເລືອກ{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-white bg-white/10 px-2 py-0.5 rounded">
                    <PlusSquare className="w-3.5 h-3.5 text-blue-400" /> Add to Home Screen
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">(ເພີ່ມໃສ່ໜ້າຈໍໂຮມ)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="leading-relaxed">
                  ກົດ{" "}
                  <span className="font-semibold text-blue-400">Add (ເພີ່ມ)</span>{" "}
                  ຢູ່ມຸມເທິງຂວາເພື່ອສຳເລັດການຕິດຕັ້ງ
                </div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all"
            >
              ເຂົ້າໃຈແລ້ວ
            </button>
          </div>
        </div>
      )}
    </>
  );
}
