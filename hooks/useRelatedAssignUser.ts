import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/axiosInstance";
import { z } from "zod";
import { AdminUserSchema, AdminUser } from "./useAssignUser";

// ── Types & Schemas ──────────────────────────────────────────────────────────

export interface RelatedAssignItem {
  relatedAssign?: {
    id: number;
    employee?: {
      id: number;
      first_name: string;
      last_name: string;
      gender?: string | null;
      emp_code: string;
      empimg?: string | null;
    } | null;
  };
}

export interface RelatedDocDetail {
  id: number;
  title: string;
  description?: string | null;
  docfile?: string | null;
  departmentId?: number | null;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    department_name?: string | null;
    department_code?: string | null;
  } | null;
  createdBy?: {
    id: number;
    employee?: {
      first_name: string;
      last_name: string;
      emp_code: string;
    } | null;
  };
  relatedAssigns?: RelatedAssignItem[];
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useRelatedAssignUser(relatedDocId: number | null) {
  const [doc, setDoc] = useState<RelatedDocDetail | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!relatedDocId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [docRes, usersRes] = await Promise.all([
        apiClient.get<RelatedDocDetail>(`/api/relateddocs/${relatedDocId}`),
        apiClient.get<unknown[]>("/api/users/admin"),
      ]);

      setDoc(docRes.data);

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
  }, [relatedDocId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const saveBulkAssign = async (userIds: number[]): Promise<boolean> => {
    if (!relatedDocId) return false;
    setSaving(true);
    setSaveError(null);
    try {
      await apiClient.put(`/api/relatedassigns/${relatedDocId}`, {
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
