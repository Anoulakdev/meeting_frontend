"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import apiClient from "@/lib/axiosInstance";
import { getCurrentUser, clearUserCache } from "@/lib/auth";

export default function ChangePasswordView() {
  const router = useRouter();

  // Current user state
  const [user, setUser] = useState<any>(null);
  const [fetchingUser, setFetchingUser] = useState(true);

  // Form states
  const [oldPassword, setOldPassword] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");

  // Visibility toggles
  const [showOld, setShowOld] = useState(false);
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch logged in user to get their user ID (cached)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        if (data) {
          setUser(data);
        } else {
          toast.error("ບໍ່ສາມາດດຶງຂໍ້ມູນຜູ້ໃຊ້ງານໄດ້");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user?.id) {
      setErrorMessage("ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້ງານ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
      return;
    }

    if (!oldPassword.trim()) {
      setErrorMessage("ກະລຸນາປ້ອນລະຫັດຜ່ານປັດຈຸບັນ");
      return;
    }

    if (!password1.trim()) {
      setErrorMessage("ກະລຸນາປ້ອນລະຫັດຜ່ານໃໝ່");
      return;
    }

    if (password1.length < 6) {
      setErrorMessage("ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຄວາມຍາວຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ");
      return;
    }

    if (password1 === oldPassword) {
      setErrorMessage("ລະຫັດຜ່ານໃໝ່ຕ້ອງບໍ່ຄືກັນກັບລະຫັດຜ່ານເກົ່າ");
      return;
    }

    if (password1 !== password2) {
      setErrorMessage("ລະຫັດຜ່ານໃໝ່ ແລະ ຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ");
      return;
    }

    setSubmitting(true);

    try {
      // Backend route: PUT /api/users/changepassword/:id
      await apiClient.put(`/api/users/changepassword/${user.id}`, {
        oldpassword: oldPassword,
        password1: password1,
        password2: password2,
      });

      setSuccess(true);
      toast.success("ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ! ກຳລັງອອກຈາກລະບົບ...");

      // Automatically logout and redirect to /signin
      setTimeout(async () => {
        const basePath = process.env.NODE_ENV === "production" ? "/meeting_notice" : "";
        try {
          await fetch(`${basePath}/api/auth/logout`, { method: "POST" });
        } finally {
          clearUserCache();
          localStorage.removeItem("userRoleId");
          window.location.href = `${basePath}/signin`;
        }
      }, 1500);
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message;
      if (serverMessage === "Old password is incorrect") {
        setErrorMessage("ລະຫັດຜ່ານປັດຈຸບັນ (Old password) ບໍ່ຖືກຕ້ອງ");
      } else if (serverMessage === "Password not match") {
        setErrorMessage("ລະຫັດຜ່ານໃໝ່ທັງສອງຊ່ອງບໍ່ກົງກັນ");
      } else if (typeof serverMessage === "string") {
        setErrorMessage(serverMessage);
      } else if (Array.isArray(serverMessage) && serverMessage.length > 0) {
        setErrorMessage(serverMessage.join(", "));
      } else {
        setErrorMessage("ເກີດຂໍ້ຜິດພາດໃນການປ່ຽນລະຫັດຜ່ານ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ");
      }
      setSubmitting(false);
    }
  };

  const firstName = user?.employee?.first_name || user?.username || "";
  const lastName = user?.employee?.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim() || user?.username || "-";
  const empCode = user?.employee?.emp_code || user?.username || "-";

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header and Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border shadow-sm hover:scale-105"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
            color: "rgb(var(--text-primary))",
          }}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ປ່ຽນລະຫັດຜ່ານ
          </h1>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
            ກະລຸນາປ້ອນລະຫັດຜ່ານເກົ່າ ແລະ ກຳນົດລະຫັດຜ່ານໃໝ່ຂອງທ່ານ
          </p>
        </div>
      </div>

      {fetchingUser ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(var(--brand))" }} />
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border shadow-xl overflow-hidden backdrop-blur-sm"
          style={{
            background: "rgb(var(--card))",
            borderColor: "rgb(var(--border))",
          }}
        >
          {/* User Info Strip */}
          <div
            className="px-6 py-4 border-b flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, rgba(30, 58, 138, 0.08), rgba(59, 130, 246, 0.04))",
              borderColor: "rgb(var(--border))",
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-md shrink-0"
              style={{
                background: "linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(29, 78, 216) 100%)",
              }}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                {fullName}
              </div>
              <div className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                ບັນຊີຜູ້ໃຊ້: <span className="font-semibold text-blue-600 dark:text-blue-400">@{user?.username}</span> • ລະຫັດ: {empCode}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Success state */}
            {success ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
                  ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ!
                </h3>
                <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "rgb(var(--text-secondary))" }}>
                  ລະບົບກຳລັງພາທ່ານອອກຈາກລະບົບ ເພື່ອໃຫ້ທ່ານເຂົ້າສູ່ລະບົບໃໝ່ດ້ວຍລະຫັດຜ່ານໃໝ່...
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>ກຳລັງໄປໜ້າເຂົ້າສູ່ລະບົບ...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm animate-fade-in">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="flex-1 font-medium">{errorMessage}</span>
                  </div>
                )}

                {/* Old Password */}
                <div>
                  <label
                    htmlFor="oldpassword"
                    className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    ລະຫັດຜ່ານປັດຈຸບັນ (Current Password) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="oldpassword"
                      type={showOld ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="ປ້ອນລະຫັດຜ່ານປັດຈຸບັນ"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                      style={{
                        border: "1.5px solid rgb(var(--border))",
                        color: "rgb(var(--text-primary))",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgb(var(--brand))")}
                      onBlur={(e) => (e.target.style.borderColor = "rgb(var(--border))")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="password1"
                    className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    ລະຫັດຜ່ານໃໝ່ (New Password) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="password1"
                      type={showPass1 ? "text" : "password"}
                      value={password1}
                      onChange={(e) => setPassword1(e.target.value)}
                      placeholder="ປ້ອນລະຫັດຜ່ານໃໝ່ (ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ)"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                      style={{
                        border: "1.5px solid rgb(var(--border))",
                        color: "rgb(var(--text-primary))",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgb(var(--brand))")}
                      onBlur={(e) => (e.target.style.borderColor = "rgb(var(--border))")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass1(!showPass1)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPass1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="password2"
                    className="block text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    ຢືນຢັນລະຫັດຜ່ານໃໝ່ (Confirm New Password) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <input
                      id="password2"
                      type={showPass2 ? "text" : "password"}
                      value={password2}
                      onChange={(e) => setPassword2(e.target.value)}
                      placeholder="ຢືນຢັນລະຫັດຜ່ານໃໝ່ອີກຄັ້ງ"
                      required
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm transition-all outline-none bg-transparent"
                      style={{
                        border: "1.5px solid rgb(var(--border))",
                        color: "rgb(var(--text-primary))",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgb(var(--brand))")}
                      onBlur={(e) => (e.target.style.borderColor = "rgb(var(--border))")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass2(!showPass2)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Security Advice Note */}
                <div
                  className="p-3.5 rounded-xl text-xs space-y-1"
                  style={{
                    background: "rgba(var(--brand), 0.06)",
                    border: "1px solid rgba(var(--brand), 0.15)",
                    color: "rgb(var(--text-secondary))",
                  }}
                >
                  <div className="font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    ຂໍ້ແນະນຳຄວາມປອດໄພ
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 leading-relaxed">
                    <li>ລະຫັດຜ່ານຕ້ອງມີຄວາມຍາວຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ</li>
                    <li>ຄວນໃຊ້ທັງຕົວອັກສອນພາສາອັງກິດ ແລະ ຕົວເລກປະສົມກັນ</li>
                    <li>ເມື່ອປ່ຽນສຳເລັດ ລະບົບຈະອອກຈາກລະບົບອັດຕະໂນມັດ ເພື່ອໃຫ້ເຂົ້າສູ່ລະບົບໃໝ່</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
                    style={{
                      borderColor: "rgb(var(--border))",
                      color: "rgb(var(--text-secondary))",
                    }}
                  >
                    ຍົກເລີກ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
                    style={{
                      background: "linear-gradient(135deg, rgb(30, 58, 138) 0%, rgb(29, 78, 216) 100%)",
                      boxShadow: "0 8px 20px -4px rgba(29, 78, 216, 0.4)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ກຳລັງບັນທຶກ...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>ບັນທຶກລະຫັດຜ່ານໃໝ່</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
