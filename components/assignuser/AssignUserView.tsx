"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  Save,
} from "lucide-react";
import { decryptId } from "@/lib/crypto";
import {
  useAssignUser,
  AdminUser,
  genderPrefix,
  fullName,
} from "@/hooks/useAssignUser";
import moment from "moment";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(s: string, e: string) {
  return s === e ? moment(s).format('DD/MM/YYYY') : `${moment(s).format('DD/MM/YYYY')} ຫາ ${moment(e).format('DD/MM/YYYY')}`;
}
function formatTimeRange(s: string, e: string) {
  return `${s} - ${e}`;
}

// avatar initials color based on user id
function avatarColor(id: number) {
  const colors = [
    "linear-gradient(135deg,#6366f1,#4338ca)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#b45309)",
    "linear-gradient(135deg,#ec4899,#be185d)",
    "linear-gradient(135deg,#14b8a6,#0f766e)",
    "linear-gradient(135deg,#8b5cf6,#6d28d9)",
  ];
  return colors[id % colors.length];
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AssignUserView() {
  const params = useSearchParams();
  const router = useRouter();
  const encryptedId = params.get("id") ?? "";
  const meetingDocId = encryptedId ? Number(decryptId(encryptedId)) : null;

  const {
    doc,
    allUsers,
    loading,
    error,
    saving,
    refetch,
    saveBulkAssign,
  } = useAssignUser(meetingDocId);

  // Check if the meeting has passed
  const isPassed = useMemo(() => {
    if (!doc) return false;
    const endTimeStr = doc.endTime.length === 5 ? `${doc.endTime}:00` : doc.endTime;
    const endDateTime = new Date(`${doc.endDate}T${endTimeStr}`);
    return endDateTime < new Date();
  }, [doc]);

  // Check whether the meeting spans over Saturday or Sunday
  const hasWeekendInRange = useMemo(() => {
    if (!doc?.startDate || !doc?.endDate) return false;
    const start = moment(doc.startDate);
    const end = moment(doc.endDate);
    const current = start.clone();
    while (current.isSameOrBefore(end, 'day')) {
      const day = current.day();
      if (day === 0 || day === 6) { // 0 = Sunday, 6 = Saturday
        return true;
      }
      current.add(1, 'day');
    }
    return false;
  }, [doc]);

  // Check whether the meeting spans over a weekday (Monday to Friday)
  const hasWeekdayInRange = useMemo(() => {
    if (!doc?.startDate || !doc?.endDate) return false;
    const start = moment(doc.startDate);
    const end = moment(doc.endDate);
    const current = start.clone();
    while (current.isSameOrBefore(end, 'day')) {
      const day = current.day();
      if (day !== 0 && day !== 6) { // Not Sunday and Not Saturday
        return true;
      }
      current.add(1, 'day');
    }
    return false;
  }, [doc]);

  // Sync includeWeekend checkbox with actual saved states if they exist, otherwise default to true
  useEffect(() => {
    if (doc) {
      if (doc.detailDocs && doc.detailDocs.length > 0) {
        const hasSavedWeekend = doc.detailDocs.some((d) => {
          const day = moment(d.dateActive).day();
          return day === 0 || day === 6;
        });
        setIncludeWeekend(hasSavedWeekend);
      } else {
        setIncludeWeekend(true);
      }
    }
  }, [doc]);

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  // local checked set — mirrors what is currently assigned
  const [pendingIds, setPendingIds] = useState<Set<number> | null>(null);
  const [includeWeekend, setIncludeWeekend] = useState(true);

  // Assigned user IDs from server
  const serverAssignedIds = useMemo<Set<number>>(
    () => new Set(
      (doc?.assigns ?? [])
        .map((a) => a.assign?.id)
        .filter((id): id is number => typeof id === "number")
    ),
    [doc]
  );

  // Use pendingIds if set (user has made changes), else fall back to server state
  const checkedIds: Set<number> = pendingIds ?? serverAssignedIds;

  const selectedUsers = useMemo(() => {
    const list: Array<{
      id: number;
      employee: {
        first_name: string;
        last_name: string;
        gender?: string | null;
        emp_code: string;
        empimg?: string | null;
      };
    }> = [];

    for (const id of Array.from(checkedIds)) {
      // 1. Try to find in allUsers
      const foundInAll = allUsers.find((u) => u.id === id);
      if (foundInAll) {
        list.push(foundInAll);
        continue;
      }

      // 2. Try to find in doc.assigns
      const foundInAssigns = doc?.assigns?.find((a) => a.assign?.id === id);
      if (foundInAssigns?.assign?.employee) {
        list.push({
          id,
          employee: {
            first_name: foundInAssigns.assign.employee.first_name,
            last_name: foundInAssigns.assign.employee.last_name,
            gender: foundInAssigns.assign.employee.gender,
            emp_code: foundInAssigns.assign.employee.emp_code,
            empimg: foundInAssigns.assign.employee.empimg,
          },
        });
      } else {
        // Fallback
        list.push({
          id,
          employee: {
            first_name: "ຜູ້ໃຊ້",
            last_name: `ລະຫັດ ${id}`,
            gender: null,
            emp_code: "-",
            empimg: null,
          },
        });
      }
    }

    return list;
  }, [checkedIds, allUsers, doc]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allUsers;
    return allUsers.filter((u) => {
      const name = `${u.employee.first_name} ${u.employee.last_name}`.toLowerCase();
      return name.includes(q) || u.employee.emp_code.toLowerCase().includes(q);
    });
  }, [allUsers, search]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle a single checkbox
  const handleToggle = (u: AdminUser) => {
    const uid = u.id;
    setPendingIds((prev) => {
      const next = new Set(prev ?? serverAssignedIds);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!pendingIds) return;

    // Send the array of AdminUser.id directly
    const userIds = Array.from(pendingIds);

    const ok = await saveBulkAssign(userIds, includeWeekend);
    if (ok) {
      showToast("ບັນທຶກສຳເລັດ", true);
      setPendingIds(null); // Reset tracking since server state will be up to date after refetch
    } else {
      showToast("ບັນທຶກບໍ່ສຳເລັດ", false);
    }
  };

  // ── Invalid ID ────────────────────────────────────────────────────────────
  if (!meetingDocId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 mx-auto" style={{ color: "rgb(var(--danger))" }} />
          <p className="text-base font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            ບໍ່ພົບ ID ເອກະສານ
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white mx-auto"
            style={{ background: "rgb(var(--brand))" }}
          >
            <ArrowLeft className="w-4 h-4" />
            ກັບຄືນ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl"
          style={{
            background: toast.ok ? "rgb(16,185,129)" : "rgb(239,68,68)",
            color: "white",
          }}
        >
          {toast.ok
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ── Back + title ── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
          style={{
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))",
            color: "rgb(var(--text-secondary))",
          }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ມອບໝາຍຜູ້ເຂົ້າຮ່ວມ
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
            ຕິກເລືອກຜູ້ໃຊ້ທີ່ຈະເຂົ້າຮ່ວມການປະຊຸມ
          </p>
          {isPassed && (
            <span className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-lg" style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)" }}>
              ການປະຊຸມນີ້ສິ້ນສຸດແລ້ວ (ບໍ່ສາມາດແກ້ໄຂໄດ້)
            </span>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          {pendingIds !== null && (
            <button
              onClick={handleSave}
              disabled={saving || isPassed}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))" }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              ບັນທຶກ
            </button>
          )}
          <button
            onClick={() => { setPendingIds(null); refetch(); }}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-80"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--text-secondary))",
            }}
            title="ໂຫຼດໃໝ່"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── API Error ── */}
      {error && (
        <div
          className="flex items-center gap-3 p-4 rounded-2xl mb-6 text-sm font-medium"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "rgb(185,28,28)",
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(var(--brand))" }} />
          <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ══════════ Left: Meeting info + assigned summary ══════════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* Doc info card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
            >
              <div
                className="px-5 py-4 flex items-center gap-3 border-b"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "rgb(var(--brand)/0.1)", color: "rgb(var(--brand))" }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <p
                  className="font-semibold text-sm leading-snug flex-1 line-clamp-2"
                  style={{ color: "rgb(var(--text-primary))" }}
                >
                  {doc?.title}
                </p>
              </div>

              <div className="p-5 space-y-4">
                {[
                  {
                    icon: <MapPin className="w-4 h-4" />,
                    label: "ສະຖານທີ່",
                    value: doc?.location,
                    bg: "rgba(34,197,94,0.12)",
                    color: "rgb(21,128,61)",
                  },
                  {
                    icon: <Calendar className="w-4 h-4" />,
                    label: "ວັນທີ",
                    value: doc ? formatDateRange(doc.startDate, doc.endDate) : "-",
                    bg: "rgba(99,102,241,0.12)",
                    color: "rgb(99,102,241)",
                  },
                  {
                    icon: <Clock className="w-4 h-4" />,
                    label: "ເວລາ",
                    value: doc ? formatTimeRange(doc.startTime, doc.endTime) : "-",
                    bg: "rgba(245,158,11,0.12)",
                    color: "rgb(180,83,9)",
                  },
                ].map(({ icon, label, value, bg, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: bg, color }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-secondary))" }}>
                        {label}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                        {value ?? "-"}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Weekend filter toggle */}
                {hasWeekendInRange && hasWeekdayInRange && (
                  <div className="pt-4 border-t space-y-2" style={{ borderColor: "rgb(var(--border))" }}>
                    <label
                      onClick={(e) => {
                        if (isPassed) {
                          e.preventDefault();
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all ${isPassed ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      style={{
                        background: includeWeekend ? "rgba(99, 102, 241, 0.06)" : "rgba(var(--bg), 0.5)",
                        border: "1px solid " + (includeWeekend ? "rgba(99, 102, 241, 0.2)" : "rgb(var(--border))"),
                      }}
                      onMouseEnter={(e) => {
                        if (!isPassed && !includeWeekend) {
                          e.currentTarget.style.background = "rgb(var(--brand)/0.04)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPassed) {
                          e.currentTarget.style.background = includeWeekend ? "rgba(99, 102, 241, 0.06)" : "transparent";
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: includeWeekend ? "rgba(99,102,241,0.12)" : "rgba(var(--text-secondary), 0.1)",
                            color: includeWeekend ? "rgb(99,102,241)" : "rgb(var(--text-secondary))"
                          }}
                        >
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: "rgb(var(--text-primary))" }}>
                            ລວມວັນເສົາ - ວັນອາທິດ
                          </p>
                          <p className="text-[10px] truncate" style={{ color: "rgb(var(--text-secondary))" }}>
                            ບັນທຶກ ແລະ ໃຫ້ແຈ້ງເຕືອນໃນວັນພັກດ້ວຍ
                          </p>
                        </div>
                      </div>

                      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                        <input
                          type="checkbox"
                          checked={includeWeekend}
                          disabled={saving || isPassed}
                          onChange={(e) => {
                            if (!isPassed) {
                              setIncludeWeekend(e.target.checked);
                              // Mark as dirty so the Save button shows up even if userIds have not changed
                              if (pendingIds === null) {
                                setPendingIds(new Set(serverAssignedIds));
                              }
                            }
                          }}
                          className="sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                          style={{
                            borderColor: includeWeekend ? (isPassed ? "rgba(99,102,241,0.5)" : "rgb(99,102,241)") : "rgb(var(--border))",
                            background: includeWeekend
                              ? "linear-gradient(135deg,rgb(99,102,241),rgb(79,70,229))"
                              : "transparent",
                          }}
                        >
                          {includeWeekend && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 14 10" fill="none">
                              <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned summary */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2 border-b"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <Users className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
                <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  ຜູ້ໄດ້ຮັບການເລືອກ
                </p>
                <span
                  className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgb(var(--brand)/0.12)", color: "rgb(var(--brand))" }}
                >
                  {selectedUsers.length}
                </span>
              </div>
              <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
                {selectedUsers.length === 0 ? (
                  <p className="text-xs text-center py-6" style={{ color: "rgb(var(--text-secondary))" }}>
                    ຍັງບໍ່ໄດ້ເລືອກຜູ້ໃຊ້
                  </p>
                ) : (
                  selectedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{
                        background: "rgba(16,185,129,0.07)",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      {u.employee.empimg ? (
                        <img
                          src={u.employee.empimg}
                          alt={fullName(u as any)}
                          className="w-7 h-7 rounded-full object-cover object-top shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: avatarColor(u.id) }}
                        >
                          {u.employee.first_name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "rgb(var(--text-primary))" }}>
                          {genderPrefix(u.employee.gender)} {fullName(u as any)}
                        </p>
                        <p className="text-[10px]" style={{ color: "rgb(var(--text-secondary))" }}>
                          {u.employee.emp_code}
                        </p>
                      </div>
                      {saving && <Loader2 className="w-3 h-3 animate-spin shrink-0" style={{ color: "rgb(var(--text-secondary))" }} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ══════════ Right: Checkbox user list ══════════ */}
          <div
            className="lg:col-span-3 rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
          >
            {/* Toolbar */}
            <div
              className="px-5 py-4 border-b flex flex-col sm:flex-row gap-3 sm:items-center shrink-0"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "rgb(var(--text-secondary))" }}
                />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາຊື່ ຫຼື ລະຫັດພະນັກງານ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
                />
              </div>
              <span className="text-xs shrink-0" style={{ color: "rgb(var(--text-secondary))" }}>
                {filteredUsers.length} / {allUsers.length} ຄົນ
              </span>
            </div>

            {/* Header row */}
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-2.5 border-b text-[11px] font-bold uppercase tracking-wider"
              style={{ borderColor: "rgb(var(--border))", color: "rgb(var(--brand))", background: "rgb(var(--brand)/0.03)" }}
            >
              <span className="w-5" />
              <span>ຊື່ - ນາມສະກຸນ</span>
              <span>ຕຳແໜ່ງ</span>
            </div>

            {/* User list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 520 }}>
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <Users className="w-10 h-10" style={{ color: "rgb(var(--text-secondary))" }} />
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                    ບໍ່ພົບຜູ້ໃຊ້
                  </p>
                </div>
              ) : (
                filteredUsers.map((u, idx) => {
                  const isChecked = checkedIds.has(u.id);
                  const isLast = idx === filteredUsers.length - 1;
                  return (
                    <label
                      key={u.id}
                      onClick={(e) => {
                        if (isPassed) {
                          e.preventDefault();
                        }
                      }}
                      className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 transition-all select-none ${isPassed ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      style={{
                        borderBottom: isLast ? "none" : "1px solid rgb(var(--border))",
                        background: isChecked
                          ? "rgba(16,185,129,0.06)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked) e.currentTarget.style.background = "rgb(var(--brand)/0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isChecked ? "rgba(16,185,129,0.06)" : "transparent";
                      }}
                    >
                      {/* Custom Checkbox */}
                      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (!isPassed) handleToggle(u);
                          }}
                          disabled={saving || isPassed}
                          className="sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200"
                          style={{
                            borderColor: isChecked ? (isPassed ? "rgba(16,185,129,0.5)" : "rgb(16,185,129)") : "rgb(var(--border))",
                            background: isChecked
                              ? "linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))"
                              : "transparent",
                          }}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 14 10" fill="none">
                              <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Name + emp info */}
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        {u.employee.empimg ? (
                          <img
                            src={u.employee.empimg}
                            alt={fullName(u)}
                            className="w-9 h-9 rounded-full object-cover object-top shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: avatarColor(u.id) }}
                          >
                            {u.employee.first_name.charAt(0)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: "rgb(var(--text-primary))" }}
                          >
                            <span style={{ color: "rgb(var(--text-secondary))", fontWeight: 500 }}>
                              {genderPrefix(u.employee.gender)}{" "}
                            </span>
                            {fullName(u)}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span
                              className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
                              style={{ background: "rgb(var(--brand)/0.1)", color: "rgb(var(--brand))" }}
                            >
                              {u.employee.emp_code}
                            </span>
                            {u.employee.division && (
                              <span className="text-[11px] truncate max-w-[180px]" style={{ color: "rgb(var(--text-secondary))" }}>
                                {u.employee.division.division_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Position */}
                      <div className="text-right shrink-0">
                        {u.employee.position && (
                          <span
                            className="text-[11px] font-medium px-2 py-1 rounded-lg"
                            style={{ background: "rgba(245,158,11,0.1)", color: "rgb(180,83,9)" }}
                          >
                            {u.employee.position.pos_name}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Footer count */}
            <div
              className="px-5 py-3 border-t flex items-center justify-between"
              style={{ borderColor: "rgb(var(--border))" }}
            >
              <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                ເລືອກແລ້ວ{" "}
                <span className="font-bold" style={{ color: "rgb(var(--brand))" }}>
                  {checkedIds.size}
                </span>{" "}
                ຈາກ {allUsers.length} ຄົນ
              </p>
              {saving && (
                <div className="flex items-center gap-2 text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ກຳລັງບັນທຶກ...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
