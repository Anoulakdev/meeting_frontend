"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, UserCog, Loader2, Save } from "lucide-react";
import apiClient from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { Select } from "@/components/ui/FormElements";

type Department = { id: number; department_name: string };
type Division = { id: number; division_name: string };

export default function ResponsibleView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("id");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">("");

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<Set<number>>(new Set());

  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingDivs, setLoadingDivs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;
    apiClient.get(`/api/users/${userId}`)
      .then(res => {
        setUserData(res.data);
      })
      .catch(err => console.error("Failed to load user details:", err));
  }, [userId]);

  useEffect(() => {
    setLoadingDepts(true);
    apiClient.get<Department[]>("/api/departments")
      .then(res => setDepartments(res.data))
      .catch(err => {
        console.error("Failed to load departments:", err);
        toast.error("ດຶງຂໍ້ມູນພະແນກໃຫຍ່ບໍ່ສຳເລັດ");
      })
      .finally(() => setLoadingDepts(false));
  }, []);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setDivisions([]);
      return;
    }
    setLoadingDivs(true);
    apiClient.get<Division[]>(`/api/divisions?departmentId=${selectedDepartmentId}`)
      .then(res => setDivisions(res.data))
      .catch(err => {
        console.error("Failed to load divisions:", err);
        toast.error("ດຶງຂໍ້ມູນພະແນກນ້ອຍບໍ່ສຳເລັດ");
      })
      .finally(() => setLoadingDivs(false));
  }, [selectedDepartmentId]);

  const handleToggleDivision = (id: number) => {
    const next = new Set(selectedDivisionIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDivisionIds(next);
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const payload = {
        divisionId: Array.from(selectedDivisionIds)
      };
      await apiClient.put(`/api/responsibles/${userId}`, payload);
      toast.success("ບັນທຶກຄວາມຮັບຜິດຊອບສຳເລັດ");
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8">
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
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            <UserCog className="w-6 h-6" style={{ color: "rgb(var(--brand))" }} />
            ກຳນົດຄວາມຮັບຜິດຊອບ
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
            ກຳນົດພະແນກ ຫຼື ໜ້າທີ່ຮັບຜິດຊອບສຳລັບຜູ້ໃຊ້: {userData?.employee ? `${userData.employee.first_name} ${userData.employee.last_name} (${userData.employee.emp_code})` : `ID: ${userId || "ບໍ່ພົບ"}`}
          </p>
        </div>
      </div>

      {/* Current Responsibilities */}
      {userData?.responsibles && userData.responsibles.length > 0 && (
        <div className="mb-6 p-5 rounded-2xl" style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: "rgb(var(--text-primary))" }}>
            ໜ້າທີ່ຮັບຜິດຊອບທີ່ຖືກບັນທຶກແລ້ວ
          </h2>
          <div className="flex flex-wrap gap-2">
            {userData.responsibles.map((resp: any) => (
              <span key={resp.divisionId} className="px-3 py-1.5 rounded-lg text-sm font-medium border" style={{ background: "rgb(var(--bg))", color: "rgb(var(--text-primary))", borderColor: "rgb(var(--border))" }}>
                {resp.division?.division_name || `Division ID: ${resp.divisionId}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: "rgb(var(--text-primary))" }}>
              1. ເລືອກຝ່າຍ (Department)
            </h2>
            {loadingDepts ? (
              <div className="flex items-center gap-2 text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                <Loader2 className="w-4 h-4 animate-spin" /> ກຳລັງໂຫຼດ...
              </div>
            ) : (
              <Select
                label=""
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value ? Number(e.target.value) : "")}
                options={[
                  { value: "", label: "ເລືອກຝ່າຍ..." },
                  ...departments.map(d => ({ value: String(d.id), label: d.department_name }))
                ]}
              />
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl flex flex-col" style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))", minHeight: "300px" }}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: "rgb(var(--border))" }}>
              <h2 className="text-sm font-bold" style={{ color: "rgb(var(--text-primary))" }}>
                2. ເລືອກພະແນກ (Division)
              </h2>
              <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "rgb(var(--brand)/0.1)", color: "rgb(var(--brand))" }}>
                ເລືອກແລ້ວ {selectedDivisionIds.size}
              </span>
            </div>

            {loadingDivs ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-2">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand))" }} />
                <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>ກຳລັງໂຫຼດຂໍ້ມູນພະແນກນ້ອຍ...</p>
              </div>
            ) : !selectedDepartmentId ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                  ກະລຸນາເລືອກຝ່າຍກ່ອນ
                </p>
              </div>
            ) : divisions.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1">
                <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                  ບໍ່ພົບຂໍ້ມູນພະແນກໃນຝ່າຍນີ້
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
                {divisions.map(div => {
                  const isChecked = selectedDivisionIds.has(div.id);
                  return (
                    <label
                      key={div.id}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border select-none"
                      style={{
                        borderColor: isChecked ? "rgb(var(--brand))" : "rgb(var(--border))",
                        background: isChecked ? "rgb(var(--brand)/0.05)" : "transparent"
                      }}
                      onMouseEnter={e => {
                        if (!isChecked) e.currentTarget.style.background = "rgb(var(--bg))";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isChecked ? "rgb(var(--brand)/0.05)" : "transparent";
                      }}
                    >
                      <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDivision(div.id)}
                          className="sr-only"
                        />
                        <div
                          className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor: isChecked ? "rgb(var(--brand))" : "rgb(var(--text-secondary)/0.5)",
                            background: isChecked ? "rgb(var(--brand))" : "transparent"
                          }}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" viewBox="0 0 14 10" fill="none">
                              <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium leading-snug" style={{ color: "rgb(var(--text-primary))" }}>
                        {div.division_name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="mt-auto pt-6">
              <button
                onClick={handleSave}
                disabled={saving || selectedDivisionIds.size === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "rgb(var(--brand))", boxShadow: "0 4px 12px rgba(var(--brand), 0.2)" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                ບັນທຶກຄວາມຮັບຜິດຊອບ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
