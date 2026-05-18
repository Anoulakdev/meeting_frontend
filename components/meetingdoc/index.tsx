"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Select, Button } from "@/components/ui/FormElements";
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
import { useMeetingDocs } from "@/hooks/useMeetingDocs";
import { MeetingDoc } from "@/schemas/meetingDoc";
import { encryptId } from "@/lib/crypto";
import moment from "moment";

const ROWS_PER_PAGE = 6;

// ── helpers ─────────────────────────────────────────────────────────────────

function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) return `${moment(startDate).format('DD/MM/YYYY')}`;
  return `${moment(startDate).format('DD/MM/YYYY')} - ${moment(endDate).format('DD/MM/YYYY')}`;
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

function getFileUrl(docfile: string | null): string | null {
  if (!docfile) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${baseUrl}/upload/document/${docfile}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export function MeetingDocument() {
  const { docs, loading, error, refetch } = useMeetingDocs();
  const router = useRouter();

  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MeetingDoc | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openEdit = (doc: MeetingDoc) => {
    setSelectedDoc(doc);
    setEditOpen(true);
  };

  const openDelete = (doc: MeetingDoc) => {
    setSelectedDoc(doc);
    setDeleteOpen(true);
  };

  // ── Export helpers ───────────────────────────────────────────────────────────

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const doc = row.original;
      return {
        ຫົວຂໍ້: doc.title,
        ສະຖານທີ່: doc.location,
        ວັນທີ: formatDateRange(doc.startDate, doc.endDate),
        ເວລາ: formatTimeRange(doc.startTime, doc.endTime),
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "MeetingDocs");
    XLSX.writeFile(workbook, "meetingdocs_export.xlsx");
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("landscape");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text("ລາຍງານໜັງສືເຊີນ", 14, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = table.getFilteredRowModel().rows.map((row) => {
      const d = row.original;
      return [
        d.title,
        d.location,
        formatDateRange(d.startDate, d.endDate),
        formatTimeRange(d.startTime, d.endTime),
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [["ຫົວຂໍ້", "ສະຖານທີ່", "ວັນທີ", "ເວລາ"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { cellPadding: 5, lineColor: [226, 232, 240], lineWidth: 0.1 },
    });

    const url = doc.output("bloburl");
    setPdfUrl(url.toString());
    setPdfModalOpen(true);
  };

  // ── Columns ──────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<MeetingDoc>[]>(
    () => [
      {
        accessorKey: "title",
        header: "ຫົວຂໍ້",
        cell: ({ row }) => {
          const doc = row.original;
          const fileUrl = getFileUrl(doc.docfile);
          return (
            <div className="flex items-start gap-3 py-0.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "rgb(var(--brand) / 0.12)" }}
              >
                <FileText className="w-4 h-4" style={{ color: "rgb(var(--brand))" }} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold leading-snug line-clamp-2"
                  style={{ color: "rgb(var(--text-primary))" }}
                >
                  {doc.title}
                </p>
                {fileUrl && (
                  <button
                    type="button"
                    onClick={() => { setPdfUrl(fileUrl); setPdfModalOpen(true); }}
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
        accessorKey: "location",
        header: "ສະຖານທີ່",
        cell: ({ getValue }) => (
          <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "date",
        header: "ວັນທີ",
        accessorFn: (row) => formatDateRange(row.startDate, row.endDate),
        cell: ({ getValue }) => (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block"
            style={{ background: "rgba(34,197,94,0.1)", color: "rgb(21,128,61)" }}
          >
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "time",
        header: "ເວລາ",
        accessorFn: (row) => formatTimeRange(row.startTime, row.endTime),
        cell: ({ getValue }) => (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block"
            style={{ background: "rgba(245,158,11,0.1)", color: "rgb(180,83,9)" }}
          >
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const doc = row.original;
          const hasAssigns = doc.assigns && doc.assigns.length > 0;

          return (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const encrypted = encryptId(doc.id);
                  router.push(`/assignuser?id=${encrypted}`);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                style={{
                  background: hasAssigns
                    ? "linear-gradient(135deg, rgb(245,158,11), rgb(217,119,6))" // Orange for Update
                    : "linear-gradient(135deg, rgb(16,185,129), rgb(5,150,105))", // Green for Assign
                  color: "white"
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
                title={hasAssigns ? "Update assignuser" : "Assign User"}
              >
                <Users className="w-4 h-4" />
              </button>
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
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDelete(doc)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm"
                style={{ background: "linear-gradient(135deg, rgb(239,68,68), rgb(185,28,28))", color: "white" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(239,68,68,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                }}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const filteredDocs = useMemo(() => {
    return docs.filter((doc) => {
      let valid = true;
      if (filterStartDate) {
        valid = valid && doc.startDate >= filterStartDate;
      }
      if (filterEndDate) {
        valid = valid && doc.endDate <= filterEndDate;
      }
      return valid;
    });
  }, [docs, filterStartDate, filterEndDate]);

  const table = useReactTable({
    data: filteredDocs,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: ROWS_PER_PAGE } },
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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: "rgb(var(--text-primary))", fontFamily: "var(--font-display)" }}
          >
            ເອກະສານ
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
          {/* <button
            onClick={exportExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--success))",
            }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:block">Excel</span>
          </button> */}
          {/* <button
            onClick={exportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              color: "rgb(var(--danger))",
            }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:block">PDF</span>
          </button> */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "rgb(var(--brand))" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            ເພີ່ມເອກະສານ
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="rounded-2xl overflow-hidden shadow-sm hover-card-effect"
        style={{ background: "rgb(var(--card))", border: "1px solid rgb(var(--border))" }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-4 border-b"
          style={{ borderColor: "rgb(var(--border))" }}
        >
          <div className="relative flex-1 max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "rgb(var(--text-secondary))" }}
            />
            <input
              type="text"
              placeholder="ຄົ້ນຫາເອກະສານ..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
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
          <div className="flex items-center gap-2 sm:ml-auto">
            <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              {table.getFilteredRowModel().rows.length} ລາຍການ
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: showFilters ? "rgb(var(--brand))" : "rgb(var(--bg))",
                border: showFilters ? "1px solid rgb(var(--brand))" : "1px solid rgb(var(--border))",
                color: showFilters ? "white" : "rgb(var(--text-secondary))",
              }}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div
            className="flex flex-col sm:flex-row gap-4 px-4 sm:px-6 py-4 border-b"
            style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--bg))" }}
          >
            <div className="w-full sm:w-40 flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                ຕັ້ງແຕ່ວັນທີ
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-primary))",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
              />
            </div>
            <div className="w-full sm:w-40 flex flex-col gap-1.5">
              <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                ຫາວັນທີ
              </label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "rgb(var(--bg))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text-primary))",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgb(var(--brand))")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgb(var(--border))")}
              />
            </div>
            <div className="sm:ml-auto flex items-end">
              <button
                onClick={() => {
                  setColumnFilters([]);
                  setFilterStartDate("");
                  setFilterEndDate("");
                }}
                className="text-sm font-medium hover:underline mb-2"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

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
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b" style={{ borderColor: "rgb(var(--border))", background: "rgb(var(--brand) / 0.03)" }}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left px-6 py-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "rgb(var(--brand))" }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
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
                      className="transition-all duration-200 border-b last:border-0 hover:shadow-sm relative z-0 hover:z-10 bg-transparent hover:bg-white dark:hover:bg-[rgb(30,41,59)]"
                      style={{ borderColor: "rgb(var(--border))" }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && table.getPageCount() > 1 && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-t"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              ໜ້າ {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <div className="flex items-center gap-1">
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
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 text-xs font-semibold"
                      style={{ color: "rgb(var(--text-secondary))" }}
                    >
                      ...
                    </span>
                  );
                }
                const i = page as number;
                return (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background:
                        table.getState().pagination.pageIndex === i
                          ? "rgb(var(--brand))"
                          : "rgb(var(--bg))",
                      border: "1px solid rgb(var(--border))",
                      color:
                        table.getState().pagination.pageIndex === i
                          ? "white"
                          : "rgb(var(--text-secondary))",
                    }}
                  >
                    {i + 1}
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
                Generating PDF...
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
                  a.download = "meetingdocs_export.pdf";
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
