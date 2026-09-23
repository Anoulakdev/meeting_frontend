"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Building,
  FileText,
  CheckCircle2,
  Save,
  Download,
  ExternalLink,
  CheckSquare,
  Square,
} from "lucide-react";
import { decryptId } from "@/lib/crypto";
import {
  useRelatedAssignUser,
  RelatedDocDetail,
} from "@/hooks/useRelatedAssignUser";
import { AdminUser, genderPrefix, fullName } from "@/hooks/useAssignUser";
import moment from "moment";

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

function getFileUrl(docfile: string | null | undefined): string | null {
  if (!docfile) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${baseUrl}/upload/document/${docfile}`;
}

export default function RelatedAssignView() {
  const params = useSearchParams();
  const router = useRouter();
  const encryptedId = params.get("id") ?? "";
  const relatedDocId = encryptedId ? Number(decryptId(encryptedId)) : null;

  const {
    doc,
    allUsers,
    loading,
    error,
    saving,
    refetch,
    saveBulkAssign,
  } = useRelatedAssignUser(relatedDocId);

  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<number> | null>(null);

  // Assigned user IDs from server
  const serverAssignedIds = useMemo<Set<number>>(
    () =>
      new Set(
        (doc?.relatedAssigns ?? [])
          .map((a) => a.relatedAssign?.id)
          .filter((id): id is number => typeof id === "number"),
      ),
    [doc],
  );

  // Use pendingIds if set, else fall back to server state
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
      const foundInAll = allUsers.find((u) => u.id === id);
      if (foundInAll) {
        list.push(foundInAll);
        continue;
      }

      const foundInAssigns = doc?.relatedAssigns?.find(
        (a) => a.relatedAssign?.id === id,
      );
      if (foundInAssigns?.relatedAssign?.employee) {
        list.push({
          id,
          employee: {
            first_name: foundInAssigns.relatedAssign.employee.first_name,
            last_name: foundInAssigns.relatedAssign.employee.last_name,
            gender: foundInAssigns.relatedAssign.employee.gender,
            emp_code: foundInAssigns.relatedAssign.employee.emp_code,
            empimg: foundInAssigns.relatedAssign.employee.empimg,
          },
        });
      } else {
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
      return (
        name.includes(q) ||
        u.employee.emp_code.toLowerCase().includes(q) ||
        (u.employee.department?.department_name &&
          u.employee.department.department_name.toLowerCase().includes(q))
      );
    });
  }, [allUsers, search]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle single user
  const handleToggle = (u: AdminUser) => {
    const uid = u.id;
    setPendingIds((prev) => {
      const next = new Set(prev ?? serverAssignedIds);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  // Select all filtered users
  const handleSelectAllFiltered = () => {
    setPendingIds((prev) => {
      const next = new Set(prev ?? serverAssignedIds);
      const allFilteredChecked = filteredUsers.every((u) => next.has(u.id));
      if (allFilteredChecked) {
        // Deselect all filtered
        filteredUsers.forEach((u) => next.delete(u.id));
      } else {
        // Select all filtered
        filteredUsers.forEach((u) => next.add(u.id));
      }
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (!pendingIds) return;
    const userIds = Array.from(pendingIds);

    const ok = await saveBulkAssign(userIds);
    if (ok) {
      showToast("ບັນທຶກສຳເລັດ", true);
      setPendingIds(null);
    } else {
      showToast("ບັນທຶກບໍ່ສຳເລັດ", false);
    }
  };

  const fileUrl = getFileUrl(doc?.docfile);
  const isAllFilteredChecked =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => checkedIds.has(u.id));

  // ── Invalid ID ──
  if (!relatedDocId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <AlertCircle
            className="w-12 h-12 mx-auto"
            style={{ color: "rgb(var(--danger))" }}
          />
          <p
            className="text-base font-semibold"
            style={{ color: "rgb(var(--text-primary))" }}
          >
            ບໍ່ພົບ ID ເອກະສານ
          </p>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white mx-auto shadow-sm"
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
          {toast.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Header: Back + Title ── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-80 shadow-sm"
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
            style={{
              color: "rgb(var(--text-primary))",
              fontFamily: "var(--font-display)",
            }}
          >
            ມອບໝາຍເອກະສານທີ່ຕິດພັນ
          </h1>
          <p
            className="text-sm mt-0.5"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            ຕິກເລືອກຜູ້ໃຊ້ທີ່ຈະໄດ້ຮັບເອກະສານນີ້
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {pendingIds !== null && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-85 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg,rgb(16,185,129),rgb(5,150,105))",
              }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              ບັນທຶກ
            </button>
          )}
          <button
            onClick={() => {
              setPendingIds(null);
              refetch();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:opacity-80 shadow-sm"
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

      {/* ── Error Banner ── */}
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
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "rgb(var(--brand))" }}
          />
          <p
            className="text-sm"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            ກຳລັງໂຫຼດຂໍ້ມູນ...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ══════════ Left: Document Info + Assigned Summary ══════════ */}
          <div className="lg:col-span-2 space-y-4">
            {/* Document Info Card */}
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
              }}
            >
              <div
                className="px-5 py-4 flex items-center gap-3 border-b"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgb(var(--brand)/0.1)",
                    color: "rgb(var(--brand))",
                  }}
                >
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="font-semibold text-sm leading-snug line-clamp-2"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {doc?.title}
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Department */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(99,102,241,0.12)",
                      color: "rgb(99,102,241)",
                    }}
                  >
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      ຝ່າຍ
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--text-primary))" }}
                    >
                      {doc?.department?.department_name ?? "-"}
                    </p>
                  </div>
                </div>

                {/* Date Created */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(16,185,129,0.12)",
                      color: "rgb(16,185,129)",
                    }}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      ວັນທີສ້າງ
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "rgb(var(--text-primary))" }}
                    >
                      {doc?.createdAt
                        ? moment(doc.createdAt).format("DD/MM/YYYY HH:mm")
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {doc?.description && (
                  <div className="pt-3 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      ລາຍລະອຽດ
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgb(var(--text-primary))" }}
                    >
                      {doc.description}
                    </p>
                  </div>
                )}

                {/* File Attachment */}
                {fileUrl && (
                  <div className="pt-3 border-t" style={{ borderColor: "rgb(var(--border))" }}>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-85 shadow-sm"
                      style={{
                        background: "rgb(var(--brand)/0.08)",
                        color: "rgb(var(--brand))",
                        border: "1px solid rgb(var(--brand)/0.2)",
                      }}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="truncate flex-1">ດາວໂຫຼດ / ເບິ່ງເອກະສານ</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Selected Users Summary Card */}
            <div
              className="rounded-2xl overflow-hidden shadow-sm"
              style={{
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
              }}
            >
              <div
                className="px-5 py-3 flex items-center gap-2 border-b"
                style={{ borderColor: "rgb(var(--border))" }}
              >
                <Users
                  className="w-4 h-4"
                  style={{ color: "rgb(var(--brand))" }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "rgb(var(--text-primary))" }}
                >
                  ຜູ້ໄດ້ຮັບການເລືອກ
                </p>
                <span
                  className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgb(var(--brand)/0.12)",
                    color: "rgb(var(--brand))",
                  }}
                >
                  {selectedUsers.length}
                </span>
              </div>
              <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
                {selectedUsers.length === 0 ? (
                  <p
                    className="text-xs text-center py-6"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
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
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "rgb(var(--text-primary))" }}
                        >
                          {genderPrefix(u.employee.gender)}{" "}
                          {fullName(u as any)}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: "rgb(var(--text-secondary))" }}
                        >
                          {u.employee.emp_code}
                        </p>
                      </div>
                      {saving && (
                        <Loader2
                          className="w-3 h-3 animate-spin shrink-0"
                          style={{ color: "rgb(var(--text-secondary))" }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ══════════ Right: Checkbox User List ══════════ */}
          <div
            className="lg:col-span-3 rounded-2xl overflow-hidden flex flex-col shadow-sm"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
            }}
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
                  placeholder="ຄົ້ນຫາຊື່, ລະຫັດ ຫຼື ຝ່າຍ..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: "rgb(var(--bg))",
                    border: "1px solid rgb(var(--border))",
                    color: "rgb(var(--text-primary))",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "rgb(var(--brand))")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "rgb(var(--border))")
                  }
                />
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:opacity-85 shadow-sm"
                  style={{
                    background: isAllFilteredChecked
                      ? "rgba(239, 68, 68, 0.1)"
                      : "rgb(var(--brand)/0.08)",
                    color: isAllFilteredChecked
                      ? "rgb(239, 68, 68)"
                      : "rgb(var(--brand))",
                    border: isAllFilteredChecked
                      ? "1px solid rgba(239, 68, 68, 0.2)"
                      : "1px solid rgb(var(--brand)/0.2)",
                  }}
                >
                  {isAllFilteredChecked ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>ຍົກເລີກທັງໝົດ</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>ເລືອກທັງໝົດ</span>
                    </>
                  )}
                </button>

                <span
                  className="text-xs font-medium"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  {filteredUsers.length} / {allUsers.length} ຄົນ
                </span>
              </div>
            </div>

            {/* Header row */}
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-2.5 border-b text-[11px] font-bold uppercase tracking-wider"
              style={{
                borderColor: "rgb(var(--border))",
                color: "rgb(var(--brand))",
                background: "rgb(var(--brand)/0.03)",
              }}
            >
              <span className="w-5" />
              <span>ຊື່ - ນາມສະກຸນ</span>
              <span>ຝ່າຍ / ຕຳແໜ່ງ</span>
            </div>

            {/* User list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 540 }}>
              {filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <Users
                    className="w-10 h-10"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
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
                      onClick={() => handleToggle(u)}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-3.5 transition-all select-none cursor-pointer"
                      style={{
                        borderBottom: isLast
                          ? "none"
                          : "1px solid rgb(var(--border))",
                        background: isChecked
                          ? "rgba(16,185,129,0.06)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked)
                          e.currentTarget.style.background =
                            "rgb(var(--brand)/0.04)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: isChecked
                            ? "rgb(16,185,129)"
                            : "rgb(var(--bg))",
                          border: isChecked
                            ? "1px solid rgb(16,185,129)"
                            : "1.5px solid rgb(var(--border))",
                        }}
                      >
                        {isChecked && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 min-w-0">
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
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: avatarColor(u.id) }}
                          >
                            {u.employee.first_name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{ color: "rgb(var(--text-primary))" }}
                          >
                            {genderPrefix(u.employee.gender)} {fullName(u)}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "rgb(var(--text-secondary))" }}
                          >
                            {u.employee.emp_code}
                            {u.employee.department?.department_name && (
                              <span className="ml-2 font-normal">
                                • {u.employee.department.department_name}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Position / Dept Badge */}
                      <div className="text-right">
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-lg"
                          style={{
                            background: "rgb(var(--brand)/0.08)",
                            color: "rgb(var(--brand))",
                          }}
                        >
                          {u.employee.position?.pos_name ??
                            u.employee.department?.department_name ??
                            "-"}
                        </span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
