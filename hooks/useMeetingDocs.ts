import { useState, useEffect, useCallback } from "react";
import apiClient from "@/lib/axiosInstance";
import { MeetingDoc, MeetingDocSchema } from "@/schemas/meetingDoc";
import { z } from "zod";

export interface UseMeetingDocsOptions {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

interface UseMeetingDocsReturn {
  docs: MeetingDoc[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMeetingDocs(options: UseMeetingDocsOptions = {}): UseMeetingDocsReturn {
  const [docs, setDocs] = useState<MeetingDoc[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page, limit, search, startDate, endDate } = options;

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.append("page", String(page));
      if (limit !== undefined) params.append("limit", String(limit));
      if (search !== undefined && search.trim() !== "") {
        params.append("search", search.trim());
      }
      if (startDate !== undefined && startDate !== "") {
        params.append("startDate", startDate);
      }
      if (endDate !== undefined && endDate !== "") {
        params.append("endDate", endDate);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/meetingdocs?${queryString}` : "/api/meetingdocs";

      const res = await apiClient.get<any>(url);

      let docsData: MeetingDoc[] = [];
      let totalCount = 0;
      let pagesCount = 1;

      if (Array.isArray(res.data)) {
        const parsed = z.array(MeetingDocSchema).safeParse(res.data);
        if (parsed.success) {
          docsData = parsed.data;
        } else {
          console.warn("MeetingDoc parse warning:", parsed.error);
          docsData = res.data as MeetingDoc[];
        }
        totalCount = docsData.length;
        pagesCount = 1;
      } else if (res.data && typeof res.data === "object" && "data" in res.data) {
        const paginatedData = res.data as { data: unknown[]; total: number; totalPages: number };
        const parsed = z.array(MeetingDocSchema).safeParse(paginatedData.data);
        if (parsed.success) {
          docsData = parsed.data;
        } else {
          console.warn("MeetingDoc parse warning:", parsed.error);
          docsData = paginatedData.data as MeetingDoc[];
        }
        totalCount = paginatedData.total;
        pagesCount = paginatedData.totalPages;
      }

      setDocs(docsData);
      setTotal(totalCount);
      setTotalPages(pagesCount);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load documents";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, startDate, endDate]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { docs, total, totalPages, loading, error, refetch: fetchDocs };
}
