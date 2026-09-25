"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Building,
  Calendar,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { encryptId } from "@/lib/crypto";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/FormElements";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { AddModal } from "./AddModal";
import { EditModal } from "./EditModal";
import { DeleteModal } from "./DeleteModal";
import { useRelatedDocs } from "@/hooks/useRelatedDocs";
import { useDebounce } from "@/hooks/useDebounce";
import { RelatedDoc, Department } from "@/schemas/relatedDoc";
import apiClient from "@/lib/axiosInstance";
import moment from "moment";

function ButtonTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };

  return (
    <div className="inline-block relative">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        onMouseDown={() => setShow(false)}
        className="flex items-center justify-center"
      >
        {children}
      </div>
      {show && text && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-900/95 dark:bg-gray-100/95 backdrop-blur-sm text-white dark:text-gray-900 text-xs font-semibold py-1.5 px-3 rounded-xl shadow-xl border border-white/10 dark:border-black/5 whitespace-nowrap transition-all duration-200"
          style={{ left: pos.x, top: pos.y - 6 }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/95 dark:border-t-gray-100/95"></div>
        </div>,
        document.body
      )}
    </div>
  );
}

const ROWS_PER_PAGE = 7;

function getFileUrl(docfile: string | null | undefined): string | null {
  if (!docfile) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${baseUrl}/upload/document/${docfile}`;
}

export function RelatedDocument() {
  const router = useRouter();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(ROWS_PER_PAGE);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Department dropdown options
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await apiClient.get<Department[]>("/api/departments/select");
        if (Array.isArray(res.data)) {
          setDepartments(res.data);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    fetchDepts();
  }, []);

  const debouncedSearch = useDebounce(globalFilter, 300);

  const { docs, total, totalPages, loading, error, refetch } = useRelatedDocs({
    page: pageIndex + 1,
    limit: pageSize,
    search: debouncedSearch,
    departmentId: filterDepartmentId,
    startDate: filterStartDate,
    endDate: filterEndDate,
  });

  // Reset to first page when search, department or date filters change
  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, filterDepartmentId, filterStartDate, filterEndDate]);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<RelatedDoc | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const openEdit = (doc: RelatedDoc) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: RelatedDoc) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<RelatedDoc>[]>(
    () => [
      {
        accessorKey: "title",
        header: "ຫົວຂໍ້",
        size: 340,
        cell: ({ row }) => {
          const doc = row.original;
          const fileUrl = getFileUrl(doc.docfile);
          return (
            <div className="flex items-start gap-3 py-0.5 max-w-sm">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgb(var(--brand) / 0.12)" }}
              >
                <FileText className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold leading-snug line-clamp-2"
                  style={{ color: "rgb(var(--text-primary))" }}
                  title={doc.title}
                >
                  {doc.title}
                </p>
                {fileUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPdfUrl(fileUrl);
                      setPdfModalOpen(true);
                    }}
                    className="text-[11px] font-medium mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors"
                    style={{ background: "rgb(var(--brand) / 0.1)", color: "rgb(var(--brand))" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--brand) / 0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--brand) / 0.1)")}
                  >
                    ເບິ່ງໄຟລ໌
                  </button>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "ລາຍລະອຽດ",
        size: 320,
        cell: ({ getValue }) => {
          const val = getValue() as string | null | undefined;
          return (
            <div className="max-w-md">
              <p
                className="text-sm line-clamp-2 leading-relaxed"
                style={{ color: "rgb(var(--text-secondary))" }}
                title={val && val.trim() ? val : undefined}
              >
                {val && val.trim() ? val : "-"}
              </p>
            </div>
          );
        },
      },
      {
        id: "department",
        header: "ຝ່າຍ",
        size: 180,
        accessorFn: (row) => row.department?.department_name ?? "-",
        cell: ({ row }) => {
          const dept = row.original.department;
          return dept?.department_name ? (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap"
              style={{ background: "rgba(59,130,246,0.1)", color: "rgb(29,78,216)" }}
            >
              {dept.department_name}
            </span>
          ) : (
            <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              -
            </span>
          );
        },
      },
      {
        id: "createdAt",
        header: "ວັນທີສ້າງ",
        size: 130,
        accessorFn: (row) => (row.createdAt ? moment(row.createdAt).format("DD/MM/YYYY") : "-"),
        cell: ({ getValue }) => (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block whitespace-nowrap"
            style={{ background: "rgba(34,197,94,0.1)", color: "rgb(21,128,61)" }}
          >
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "actions",
        header: "#",
        size: 130,
        cell: ({ row }) => {
          const doc = row.original;
          const hasAssigns = doc.relatedAssigns && doc.relatedAssigns.length > 0;
          return (
            <div className="flex items-center gap-1.5">
              <ButtonTooltip text={hasAssigns ? "ແກ້ໄຂການມອບໝາຍ" : "ມອບໝາຍຜູ້ໃຊ້"}>
                <button
                  onClick={() => {
                    const encrypted = encryptId(doc.id);
                    router.push(`/relatedassign?id=${encrypted}`);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                  style={{
                    background: hasAssigns
                      ? "linear-gradient(135deg, rgb(245,158,11), rgb(217,119,6))" // Orange for Update
                      : "linear-gradient(135deg, rgb(16,185,129), rgb(5,150,105))", // Green for Assign
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = hasAssigns
                      ? "0 4px 12px rgba(245,158,11,0.3)"
                      : "0 4px 12px rgba(16,185,129,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  }}
                >
                  <Users className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              <ButtonTooltip text="ແກ້ໄຂ">
                <button
                  onClick={() => openEdit(doc)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                  style={{ background: "linear-gradient(135deg, rgb(99,102,241), rgb(67,56,202))", color: "white" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(99,102,241,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
              <ButtonTooltip text="ລົບ">
                <button
                  onClick={() => openDelete(doc)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, rgb(239,68,68), rgb(185,28,28))",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>
            </div>
          );
        },
      },
    ],
    [router]
  );

  const table = useReactTable({
    data: docs,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
      globalFilter,
      columnFilters,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const nextState = updater({ pageIndex, pageSize });
        setPageIndex(nextState.pageIndex);
        setPageSize(nextState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
    pageCount: totalPages,
  });

  const generatePagination = () => {
    const currentPage = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const pages: (number | "...")[] = [];

    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
    } else if (currentPage <= 2) {
      pages.push(0, 1, 2, 3, "...", pageCount - 1);
    } else if (currentPage >= pageCount - 3) {
      pages.push(0, "...", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1);
    } else {
      pages.push(0, "...", currentPage - 1, currentPage, currentPage + 1, "...", pageCount - 1);
    }
    return pages;
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ເອກະສານທີ່ຕິດພັນ
          </h1>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--text-secondary))",
            }}
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:block">ໂຫຼດໃໝ່</span>
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ background: "rgb(var(--brand))" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            ເພີ່ມເອກະສານ
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div
        className="rounded-2xl shadow-sm overflow-hidden border hover-card-effect"
        style={{
          background: "rgb(var(--card))",
          borderColor: "rgb(var(--border))",
        }}
      >
        {/* Filter / Search Bar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-sm w-full">
            <Search
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
              style={{ color: globalFilter ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }}
            />
            <input
              type="text"
              placeholder="ຄົ້ນຫາເອກະສານ..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: globalFilter ? "rgb(var(--brand) / 0.04)" : "rgb(var(--bg))",
                border: globalFilter ? "1px solid rgb(var(--brand))" : "1px solid rgb(var(--border))",
                color: "rgb(var(--text-primary))",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgb(var(--brand))";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--brand), 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = globalFilter ? "rgb(var(--brand))" : "rgb(var(--border))";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                style={{ color: "rgb(var(--text-secondary))" }}
                title="ລ້າງການຄົ້ນຫາ"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto sm:ml-auto">
            {/* Department Filter */}
            <div className="relative w-full sm:w-56 md:w-60 min-w-0">
              <div
                className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                style={{ color: filterDepartmentId ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }}
              >
                <Building className="w-4 h-4" />
              </div>
              <select
                value={filterDepartmentId}
                onChange={(e) => setFilterDepartmentId(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm outline-none transition-all appearance-none cursor-pointer"
                style={{
                  background: filterDepartmentId ? "rgb(var(--brand) / 0.04)" : "rgb(var(--bg))",
                  border: filterDepartmentId ? "1px solid rgb(var(--brand))" : "1px solid rgb(var(--border))",
                  color: filterDepartmentId ? "rgb(var(--brand))" : "rgb(var(--text-primary))",
                  fontWeight: filterDepartmentId ? 600 : 400,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgb(var(--brand))";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--brand), 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = filterDepartmentId ? "rgb(var(--brand))" : "rgb(var(--border))";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <option value="">ທຸກຝ່າຍ</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                style={{ color: filterDepartmentId ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto min-w-0">
              <div className="relative flex-1 min-w-0 sm:w-36 md:w-40">
                <div
                  className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                  style={{ color: filterStartDate ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full min-w-0 pl-8 sm:pl-9 pr-1.5 sm:pr-2.5 py-2 rounded-xl text-xs sm:text-sm outline-none transition-all cursor-pointer box-border"
                  style={{
                    background: filterStartDate ? "rgb(var(--brand) / 0.04)" : "rgb(var(--bg))",
                    border: filterStartDate ? "1px solid rgb(var(--brand))" : "1px solid rgb(var(--border))",
                    color: filterStartDate ? "rgb(var(--brand))" : "rgb(var(--text-primary))",
                    fontWeight: filterStartDate ? 600 : 400,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgb(var(--brand))";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--brand), 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = filterStartDate ? "rgb(var(--brand))" : "rgb(var(--border))";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title="ຕັ້ງແຕ່ວັນທີ"
                />
              </div>

              <span className="text-xs font-medium text-center shrink-0 px-0.5" style={{ color: "rgb(var(--text-secondary))" }}>
                ຫາ
              </span>

              <div className="relative flex-1 min-w-0 sm:w-36 md:w-40">
                <div
                  className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                  style={{ color: filterEndDate ? "rgb(var(--brand))" : "rgb(var(--text-secondary))" }}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full min-w-0 pl-8 sm:pl-9 pr-1.5 sm:pr-2.5 py-2 rounded-xl text-xs sm:text-sm outline-none transition-all cursor-pointer box-border"
                  style={{
                    background: filterEndDate ? "rgb(var(--brand) / 0.04)" : "rgb(var(--bg))",
                    border: filterEndDate ? "1px solid rgb(var(--brand))" : "1px solid rgb(var(--border))",
                    color: filterEndDate ? "rgb(var(--brand))" : "rgb(var(--text-primary))",
                    fontWeight: filterEndDate ? 600 : 400,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgb(var(--brand))";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--brand), 0.1)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = filterEndDate ? "rgb(var(--brand))" : "rgb(var(--border))";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  title="ຫາວັນທີ"
                />
              </div>
            </div>

            {/* Actions: Clear & Total Badge */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
              {(globalFilter || filterDepartmentId || filterStartDate || filterEndDate) ? (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalFilter("");
                    setFilterDepartmentId("");
                    setFilterStartDate("");
                    setFilterEndDate("");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-medium transition-all hover:opacity-85 shadow-sm"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "rgb(239, 68, 68)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                  }}
                  title="ລ້າງຕົວກອງທັງໝົດ"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ລ້າງຕົວກອງ</span>
                </button>
              ) : (
                <div className="sm:hidden" />
              )}

              {/* Total Badge */}
              <span
                className="text-xs font-semibold px-3 py-1.5 sm:py-2 rounded-xl whitespace-nowrap ml-auto sm:ml-0"
                style={{
                  background: "rgb(var(--brand) / 0.08)",
                  color: "rgb(var(--brand))",
                }}
              >
                {total} ລາຍການ
              </span>
            </div>
          </div>
        </div>
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2
              className="w-8 h-8 animate-spin"
              style={{ color: "rgb(var(--brand))" }}
            />
            <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
              ກຳລັງໂຫຼດຂໍ້ມູນ...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-8 h-8" style={{ color: "rgb(var(--danger))" }} />
            <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              ໂຫຼດຂໍ້ມູນບໍ່ສຳເລັດ
            </p>
            <p className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              {error}
            </p>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white mt-2"
              style={{ background: "rgb(var(--brand))" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              ລອງໃໝ່
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="border-b"
                    style={{
                      borderColor: "rgb(var(--border))",
                      background: "rgb(var(--brand) / 0.03)",
                    }}
                  >
                    {headerGroup.headers.map((header) => {
                      const size = header.column.columnDef.size;
                      return (
                        <th
                          key={header.id}
                          className="text-left px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap"
                          style={{
                            color: "rgb(var(--brand))",
                            width: size ? `${size}px` : undefined,
                            minWidth: size ? `${size}px` : undefined,
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: "rgb(var(--bg))" }}
                        >
                          <FileText className="w-7 h-7" style={{ color: "rgb(var(--text-secondary))" }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                            ບໍ່ພົບເອກະສານ
                          </p>
                          <p className="text-xs mt-1" style={{ color: "rgb(var(--text-secondary))" }}>
                            ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເພີ່ມເອກະສານໃໝ່.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      style={{ borderColor: "rgb(var(--border))" }}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const size = cell.column.columnDef.size;
                        return (
                          <td
                            key={cell.id}
                            className="px-6 py-4 align-top"
                            style={{
                              width: size ? `${size}px` : undefined,
                              minWidth: size ? `${size}px` : undefined,
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {total > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t"
            style={{
              borderColor: "rgb(var(--border))",
              background: "rgb(var(--card))",
            }}
          >
            <div className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              ສະແດງ {pageIndex * pageSize + 1} -{" "}
              {Math.min((pageIndex + 1) * pageSize, total)} ຈາກທັງໝົດ {total} ລາຍການ
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-40"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-secondary))",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {generatePagination().map((page, idx) => {
                if (page === "...") {
                  return (
                    <span key={idx} className="px-2 text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
                      ...
                    </span>
                  );
                }
                const isSelected = page === pageIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => table.setPageIndex(page as number)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: isSelected ? "rgb(var(--brand))" : "rgb(var(--bg))",
                      color: isSelected ? "white" : "rgb(var(--text-primary))",
                      border: isSelected ? "none" : "1px solid rgb(var(--border))",
                    }}
                  >
                    {(page as number) + 1}
                  </button>
                );
              })}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-40"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-secondary))",
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALS ─── */}
      <AddModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refetch} />

      <EditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={refetch}
        selectedDoc={selectedDoc}
      />

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onSuccess={refetch}
        selectedDoc={selectedDoc}
      />

      {/* ─── PDF PREVIEW MODAL ─── */}
      <Modal open={pdfModalOpen} onClose={() => setPdfModalOpen(false)} title="PDF Preview" size="xl">
        <div className="space-y-4">
          <div
            className="w-full h-[70vh] min-h-[500px] rounded-xl overflow-hidden border"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            {pdfUrl ? (
              <iframe src={pdfUrl} className="w-full h-full" title="PDF Preview" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-sm"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Loading PDF...
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setPdfModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (pdfUrl) {
                  const a = document.createElement("a");
                  a.href = pdfUrl;
                  a.download = "relateddoc.pdf";
                  a.click();
                }
              }}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
