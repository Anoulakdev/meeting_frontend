import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/axiosInstance";
import { z } from "zod";

// ── Schemas ──────────────────────────────────────────────────────────────────

const DepartmentSchema = z.object({
  id: z.number(),
  department_name: z.string(),
  department_code: z.string(),
  department_status: z.string(),
});

const DivisionSchema = z.object({
  id: z.number(),
  division_name: z.string(),
  division_code: z.string(),
  division_status: z.string(),
});

const UnitSchema = z.object({
  id: z.number(),
  unit_name: z.string(),
  unit_code: z.string(),
  unit_status: z.string(),
}).nullable();

const PositionSchema = z.object({
  id: z.number(),
  pos_name: z.string(),
  pos_status: z.string(),
}).nullable();

const EmployeeDetailSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  emp_code: z.string(),
  status: z.string().optional(),
  gender: z.string().nullable().optional(),
  tel: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  empimg: z.string().nullable().optional(),
  department: DepartmentSchema.optional().nullable(),
  division: DivisionSchema.optional().nullable(),
  unit: UnitSchema.optional(),
  position: PositionSchema.optional(),
});

export const AdminUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  employeeId: z.number(),
  roleId: z.number(),
  status: z.string(),
  employee: EmployeeDetailSchema,
});

const AssignedUserSchema = z.object({
  assign: z.object({
    id: z.number(),
  }).optional(),
});

const MeetingDocDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  location: z.string(),
  docfile: z.string().nullable(),
  assigns: z.array(AssignedUserSchema).optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;
export type AssignedUser = z.infer<typeof AssignedUserSchema>;
export type MeetingDocDetail = z.infer<typeof MeetingDocDetailSchema>;

// ── Helpers ──────────────────────────────────────────────────────────────────

export function genderPrefix(gender: string | null | undefined): string {
  if (gender === "Female") return "ທ່ານນາງ";
  return "ທ່ານ";
}

export function fullName(u: AdminUser): string {
  return `${u.employee.first_name} ${u.employee.last_name}`;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAssignUser(meetingDocId: number | null) {
  const [doc, setDoc] = useState<MeetingDocDetail | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!meetingDocId) return;
    setLoading(true);
    setError(null);
    try {
      const [docRes, usersRes] = await Promise.all([
        apiClient.get<unknown>(`/api/meetingdocs/${meetingDocId}`),
        apiClient.get<unknown[]>("/api/users/admin"),
      ]);

      const parsedDoc = MeetingDocDetailSchema.safeParse(docRes.data);
      setDoc(parsedDoc.success ? parsedDoc.data : (docRes.data as MeetingDocDetail));

      const parsedUsers = z.array(AdminUserSchema).safeParse(usersRes.data);
      if (parsedUsers.success) {
        setAllUsers(parsedUsers.data);
      } else {
        console.warn("AdminUser parse warning:", parsedUsers.error);
        setAllUsers(usersRes.data as AdminUser[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ");
    } finally {
      setLoading(false);
    }
  }, [meetingDocId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveBulkAssign = async (userIds: number[]): Promise<boolean> => {
    if (!meetingDocId) return false;
    setSaving(true);
    setSaveError(null);
    try {
      await apiClient.put(`/api/assigns/${meetingDocId}`, {
        userId: userIds,
      });
      await fetchData();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ບໍ່ສາມາດບັນທຶກໄດ້";
      setSaveError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    doc,
    allUsers,
    loading,
    error,
    saving,
    saveError,
    refetch: fetchData,
    saveBulkAssign,
  };
}
