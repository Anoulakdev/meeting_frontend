import { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/lib/axiosInstance";
import { RelatedDoc, RelatedDocSchema } from "@/schemas/relatedDoc";
import { z } from "zod";

export interface UseRelatedDocsOptions {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number | string;
  startDate?: string;
  endDate?: string;
}

interface UseRelatedDocsReturn {
  docs: RelatedDoc[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRelatedDocs(options: UseRelatedDocsOptions = {}): UseRelatedDocsReturn {
  const [docs, setDocs] = useState<RelatedDoc[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { page, limit, search, departmentId, startDate, endDate } = options;
  const requestIdRef = useRef(0);

  const fetchDocs = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (page !== undefined) params.append("page", String(page));
      if (limit !== undefined) params.append("limit", String(limit));
      if (search !== undefined && search.trim() !== "") {
        params.append("search", search.trim());
      }
      if (departmentId !== undefined && departmentId !== "" && departmentId !== "all") {
        params.append("departmentId", String(departmentId));
      }
      if (startDate !== undefined && startDate !== "") {
        params.append("startDate", startDate);
      }
      if (endDate !== undefined && endDate !== "") {
        params.append("endDate", endDate);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/relateddocs?${queryString}` : "/api/relateddocs";

      const res = await apiClient.get<any>(url);

      if (currentRequestId !== requestIdRef.current) return;

      let docsData: RelatedDoc[] = [];
      let totalCount = 0;
      let pagesCount = 1;

      if (Array.isArray(res.data)) {
        const parsed = z.array(RelatedDocSchema).safeParse(res.data);
        if (parsed.success) {
          docsData = parsed.data;
        } else {
          console.warn("RelatedDoc parse warning:", parsed.error);
          docsData = res.data as RelatedDoc[];
        }
        totalCount = docsData.length;
        pagesCount = 1;
      } else if (res.data && typeof res.data === "object" && "data" in res.data) {
        const paginatedData = res.data as { data: unknown[]; total: number; totalPages: number };
        const parsed = z.array(RelatedDocSchema).safeParse(paginatedData.data);
        if (parsed.success) {
          docsData = parsed.data;
        } else {
          console.warn("RelatedDoc parse warning:", parsed.error);
          docsData = paginatedData.data as RelatedDoc[];
        }
        totalCount = paginatedData.total;
        pagesCount = paginatedData.totalPages;
      }

      setDocs(docsData);
      setTotal(totalCount);
      setTotalPages(pagesCount);
    } catch (err: unknown) {
      if (currentRequestId !== requestIdRef.current) return;
      const message =
        err instanceof Error ? err.message : "Failed to load related documents";
      setError(message);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [page, limit, search, departmentId, startDate, endDate]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return { docs, total, totalPages, loading, error, refetch: fetchDocs };
}
