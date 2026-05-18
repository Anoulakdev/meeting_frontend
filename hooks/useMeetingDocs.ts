import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/axiosInstance";
import { MeetingDoc, MeetingDocSchema } from "@/schemas/meetingDoc";
import { z } from "zod";

interface UseMeetingDocsReturn {
  docs: MeetingDoc[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMeetingDocs(): UseMeetingDocsReturn {
  const [docs, setDocs] = useState<MeetingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<unknown[]>("/api/meetingdocs");
      const parsed = z.array(MeetingDocSchema).safeParse(res.data);
      if (parsed.success) {
        setDocs(parsed.data);
      } else {
        console.warn("MeetingDoc parse warning:", parsed.error);
        // ยังเซ็ตข้อมูลดิบไว้ใช้ได้แม้ schema ไม่ match ทั้งหมด
        setDocs(res.data as MeetingDoc[]);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { docs, loading, error, refetch: fetchDocs };
}
