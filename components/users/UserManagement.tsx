"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Users,
  Loader2,
  RefreshCw,
  KeyRound,
  UserCog,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Modal } from "@/components/ui/Modal";
import { Select, Button, Badge } from "@/components/ui/FormElements";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { EditUserModal } from "./EditUserModal";
import apiClient from "@/lib/axiosInstance";
import { encryptId } from "@/lib/crypto";

export type ApiUser = {
  id: number;
  username: string;
  role: { name: string };
  status: string;
  employee: {
    first_name: string;
    last_name: string;
    emp_code: string;
    status: string;
    email: string | null;
    tel: string | null;
    empimg: string | null;
    department?: { department_name: string } | null;
    division?: { division_name: string } | null;
    position?: { pos_name: string } | null;
    createdAt: string;
  };
};

export type User = {
  id: number;
  name: string;
  empCode: string;
  email: string;
  tel: string;
  role: string;
  status: string;
  department: string;
  division: string;
  position: string;
  avatar: string;
  avatarColor: string;
  empimg: string | null;
  raw: ApiUser;
};

const roleColors: Record<string, "blue" | "green" | "red" | "yellow" | "purple" | "gray"> = {
  Admin: "green",
  SuperAdmin: "yellow",
  Editor: "yellow",
  Viewer: "gray",
  User: "purple",
};

const statusColors: Record<string, "blue" | "green" | "red" | "yellow" | "purple" | "gray"> = {
  Active: "green",
  Inactive: "red",
  Pending: "yellow",
};

const avatarColors = [
  "61 109 255", "34 197 94", "245 158 11", "239 68 68",
  "168 85 247", "20 184 166", "251 146 60", "99 102 241",
];


function TableTooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
    setShow(true);
  };

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className="w-full"
      >
        {children}
      </div>
      {show && text && text !== "-" && typeof document !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none -translate-x-1/2 -translate-y-full bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 text-xs py-1.5 px-3 rounded-lg shadow-2xl whitespace-nowrap transition-opacity"
          style={{ left: pos.x, top: pos.y - 6 }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-gray-100"></div>
        </div>,
        document.body
      )}
    </>
  );
}

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

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [roles, setRoles] = useState<{ id: number, name: string }[]>([]);
  const router = useRouter();

  // Controlled Pagination and total counts
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: ROWS_PER_PAGE,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // States for filter dropdown data
  const [departmentList, setDepartmentList] = useState<{ id: number; department_name: string }[]>([]);
  const [divisionList, setDivisionList] = useState<{ id: number; division_name: string }[]>([]);
  const [positionList, setPositionList] = useState<{ id: number; pos_name: string }[]>([]);
  const [roleList, setRoleList] = useState<{ id: number; name: string }[]>([]);

  // Fetch filter options once on mount (excluding divisions)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [depRes, posRes, roleRes] = await Promise.all([
          apiClient.get<any[]>("/api/departments"),
          apiClient.get<any[]>("/api/positions"),
          apiClient.get<any[]>("/api/roles/selectrole"),
        ]);
        setDepartmentList(depRes.data);
        setPositionList(posRes.data);
        setRoleList(roleRes.data);
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    };
    fetchFilterOptions();
  }, []);

  const selectedDepartmentId = useMemo(() => {
    return (columnFilters.find(f => f.id === "department")?.value as string) || "";
  }, [columnFilters]);

  // Fetch divisions dynamically based on selected department ID
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const url = selectedDepartmentId
          ? `/api/divisions?departmentId=${selectedDepartmentId}`
          : "/api/divisions";
        const res = await apiClient.get<any[]>(url);
        setDivisionList(res.data);

        // Reset division filter if it's not valid for the new department
        const selectedDivisionId = (columnFilters.find(f => f.id === "division")?.value as string) || "";
        if (selectedDivisionId) {
          const exists = res.data.some((d: any) => String(d.id) === selectedDivisionId);
          if (!exists) {
            setColumnFilters(prev => prev.filter(f => f.id !== "division"));
          }
        }
      } catch (err) {
        console.error("Failed to fetch divisions", err);
      }
    };
    fetchDivisions();
  }, [selectedDepartmentId]);

  // Memoized options for Selects
  const departmentOptions = useMemo(() => {
    return [
      { value: "", label: "All" },
      ...departmentList.map(d => ({ value: String(d.id), label: d.department_name || "-" }))
    ];
  }, [departmentList]);

  const divisionOptions = useMemo(() => {
    return [
      { value: "", label: "All" },
      ...divisionList.map(d => ({ value: String(d.id), label: d.division_name || "-" }))
    ];
  }, [divisionList]);

  const positionOptions = useMemo(() => {
    return [
      { value: "", label: "All" },
      ...positionList.map(p => ({ value: String(p.id), label: p.pos_name || "-" }))
    ];
  }, [positionList]);

  const roleOptions = useMemo(() => {
    return [
      { value: "", label: "All" },
      ...roleList.map(r => ({ value: String(r.id), label: r.name || "-" }))
    ];
  }, [roleList]);

  const statusOptions = [
    { value: "", label: "All" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);
  const [resetting, setResetting] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const depFilter = (columnFilters.find(f => f.id === "department")?.value as string) || "";
      const divFilter = (columnFilters.find(f => f.id === "division")?.value as string) || "";
      const posFilter = (columnFilters.find(f => f.id === "position")?.value as string) || "";
      const roleFilter = (columnFilters.find(f => f.id === "role")?.value as string) || "";
      const statusFilter = (columnFilters.find(f => f.id === "status")?.value as string) || "";

      const params: Record<string, any> = {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      };

      if (globalFilter.trim()) {
        params.search = globalFilter.trim();
      }
      if (depFilter) params.departmentId = Number(depFilter);
      if (divFilter) params.divisionId = Number(divFilter);
      if (posFilter) params.posId = Number(posFilter);
      if (roleFilter) params.roleId = Number(roleFilter);
      if (statusFilter) params.status = statusFilter;

      const res = await apiClient.get<any>("/api/users", { params });

      let apiData: ApiUser[] = [];
      let total = 0;
      let totalPagesCount = 0;

      if (Array.isArray(res.data)) {
        apiData = res.data;
        total = res.data.length;
        totalPagesCount = Math.ceil(total / pagination.pageSize);
      } else if (res.data && 'data' in res.data) {
        apiData = res.data.data || [];
        total = res.data.total || 0;
        totalPagesCount = res.data.totalPages || 0;
      }

      const mappedUsers: User[] = apiData.map((u, i) => {
        const fn = u.employee?.first_name || "";
        const ln = u.employee?.last_name || "";
        const name = `${fn} ${ln}`.trim() || u.username;
        const status = u.status === "A" ? "Active" : u.status === "C" ? "Inactive" : (u.status || "Unknown");
        return {
          id: u.id,
          name,
          empCode: u.employee?.emp_code || "-",
          email: u.employee?.email || "-",
          tel: u.employee?.tel || "-",
          role: u.role?.name || "User",
          status,
          department: u.employee?.department?.department_name || "-",
          division: u.employee?.division?.division_name || "-",
          position: u.employee?.position?.pos_name || "-",
          avatar: name.charAt(0).toUpperCase() || "U",
          avatarColor: avatarColors[i % avatarColors.length],
          empimg: u.employee?.empimg || null,
          raw: u,
        };
      });
      setUsers(mappedUsers);
      setTotalCount(total);
      setTotalPages(totalPagesCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, globalFilter, columnFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await apiClient.post("/api/users");
      await fetchUsers();
      toast.success("ດຶງຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ!");
    } catch (err) {
      console.error(err);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນຜູ້ໃຊ້!");
    } finally {
      setSyncing(false);
    }
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    setEditOpen(false);
    await fetchUsers();
  };

  const toggleStatus = async (user: User) => {
    const currentStatus = user.raw.status;
    const nextStatus = currentStatus === "A" ? "C" : "A";

    try {
      await apiClient.put(`/api/users/updatestatus/${user.id}?actived=${nextStatus}`);
      toast.success("ອັບເດດສະຖານະສຳເລັດ!");
      await fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ!");
    }
  };

  const handleResetPassword = async () => {
    if (!userToReset) return;
    setResetting(true);
    try {
      await apiClient.put(`/api/users/resetpassword/${userToReset.id}`);
      toast.success("ຣີເຊັດລະຫັດຜ່ານສຳເລັດ!");
      setResetModalOpen(false);
    } catch (err) {
      toast.error("ເກີດຂໍ້ຜິດພາດໃນການຣີເຊັດລະຫັດຜ່ານ!");
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const exportData = table.getFilteredRowModel().rows.map((row) => {
      const user = row.original;
      return {
        Name: user.name,
        "Emp Code": user.empCode,
        Email: user.email,
        Tel: user.tel,
        Department: user.department,
        Division: user.division,
        Position: user.position,
        Role: user.role,
        Status: user.status,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users_export.xlsx");
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF("landscape");

    try {
      const response = await fetch('/fonts/NotoSansLao-Regular.ttf');
      const buffer = await response.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64String = window.btoa(binary);

      doc.addFileToVFS('NotoSansLao-Regular.ttf', base64String);
      doc.addFont('NotoSansLao-Regular.ttf', 'NotoSansLao', 'normal');
      doc.setFont('NotoSansLao');
    } catch (err) {
      console.error("Could not load font", err);
      doc.setFont("helvetica");
    }

    doc.setFontSize(18);
    doc.setTextColor(30, 58, 138);
    doc.text("ລາຍງານຂໍ້ມູນຜູ້ໃຊ້ງານ", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableData = table.getFilteredRowModel().rows.map((row) => {
      const user = row.original;
      return [
        user.name,
        user.empCode,
        user.tel,
        user.department,
        user.division,
        user.position,
        user.role,
        user.status,
      ];
    });

    autoTable(doc, {
      startY: 36,
      head: [["ຊື່ ແລະ ນາມສະກຸນ", "ລະຫັດ", "ເບີໂທ", "ຝ່າຍ", "ພະແນກ", "ຕຳແໜ່ງ", "ສິດຜູ້ໃຊ້", "ສະຖານະ"]],
      body: tableData,
      theme: "grid",
      styles: {
        font: "NotoSansLao",
        cellPadding: 5,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const url = doc.output("bloburl");
    setPdfUrl(url.toString());
    setPdfModalOpen(true);
  };

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "name",
        header: "ຊື່ ແລະ ນາມສະກຸນ",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3 max-w-[150px] sm:max-w-[200px] xl:max-w-[250px]">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
                style={{ background: user.empimg ? "transparent" : `rgb(${user.avatarColor})` }}
              >
                {user.empimg ? (
                  <img src={user.empimg} alt="profile" className="w-full h-full object-cover object-top" />
                ) : (
                  user.avatar
                )}
              </div>
              <div className="flex-1 min-w-0">
                <TableTooltip text={user.name}>
                  <div className="text-sm font-semibold truncate block" style={{ color: "rgb(var(--text-primary))" }}>
                    {user.name}
                  </div>
                </TableTooltip>
                <TableTooltip text={user.email}>
                  <div className="text-xs truncate block" style={{ color: "rgb(var(--text-secondary))" }}>
                    {user.email}
                  </div>
                </TableTooltip>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "empCode",
        header: "ລະຫັດພະນັກງານ",
        cell: ({ getValue }) => (
          <TableTooltip text={getValue() as string}>
            <span className="block text-sm font-medium max-w-[80px] xl:max-w-[100px] truncate" style={{ color: "rgb(var(--text-primary))" }}>
              {getValue() as string}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "tel",
        header: "ເບີໂທ",
        cell: ({ getValue }) => (
          <TableTooltip text={getValue() as string}>
            <span className="block text-sm max-w-[90px] xl:max-w-[120px] truncate" style={{ color: "rgb(var(--text-secondary))" }}>
              {getValue() as string}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "position",
        header: "ຕຳແໜ່ງ",
        cell: ({ getValue }) => (
          <TableTooltip text={getValue() as string}>
            <span className="block text-sm max-w-[100px] xl:max-w-[140px] truncate" style={{ color: "rgb(var(--text-secondary))" }}>
              {getValue() as string}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "department",
        header: "ຝ່າຍ",
        cell: ({ getValue }) => (
          <TableTooltip text={getValue() as string}>
            <span className="block text-sm max-w-[120px] xl:max-w-[150px] truncate" style={{ color: "rgb(var(--text-secondary))" }}>
              {getValue() as string}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "division",
        header: "ພະແນກ",
        cell: ({ getValue }) => (
          <TableTooltip text={getValue() as string}>
            <span className="block text-sm max-w-[120px] xl:max-w-[150px] truncate" style={{ color: "rgb(var(--text-secondary))" }}>
              {getValue() as string}
            </span>
          </TableTooltip>
        ),
      },
      {
        accessorKey: "role",
        header: "ສິດຜູ້ໃຊ້",
        cell: ({ getValue }) => {
          const role = getValue() as string;
          return <Badge color={roleColors[role] || "gray"}>{role}</Badge>;
        },
      },
      {
        accessorKey: "status",
        header: "ສະຖານະ",
        cell: ({ row, getValue }) => {
          const status = getValue() as string;
          const user = row.original;
          return (
            <div
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity p-1 -m-1 rounded-lg"
              onClick={() => toggleStatus(user)}
              title={user.raw.status === "A" ? "ຄລິກເພື່ອປິດການໃຊ້ງານ" : "ຄລິກເພື່ອເປີດການໃຊ້ງານ"}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    status === "Active"
                      ? "rgb(34 197 94)"
                      : status === "Pending"
                        ? "rgb(245 158 11)"
                        : "rgb(239 68 68)",
                }}
              />
              <Badge color={statusColors[status] || "gray"}>{status}</Badge>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "#",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="relative flex items-center gap-1">
              <ButtonTooltip text="ແກ້ໄຂສິດ">
                <button
                  onClick={() => openEdit(user)}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: "rgba(245, 158, 11, 0.1)", color: "rgb(245, 158, 11)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.1)";
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </ButtonTooltip>

              <ButtonTooltip text="ຣີເຊັດລະຫັດຜ່ານ">
                <button
                  onClick={() => {
                    setUserToReset(user);
                    setResetModalOpen(true);
                  }}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  }}
                >
                  <KeyRound className="w-4 h-4" />
                </button>
              </ButtonTooltip>

              <ButtonTooltip text="FCM Token">
                <button
                  onClick={() => {
                    const encrypted = encryptId(user.id);
                    router.push(`/fcmtoken?id=${encrypted}`);
                  }}
                  className="p-2 rounded-lg transition-all"
                  style={{ background: "rgba(14, 165, 233, 0.1)", color: "rgb(14, 165, 233)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(14, 165, 233, 0.1)";
                  }}
                >
                  <Bell className="w-4 h-4" />
                </button>
              </ButtonTooltip>

              <ButtonTooltip
                text={
                  ((user.raw as any).roleId === 2 || (user.raw as any).role?.id === 2)
                    ? "ກຳນົດຄວາມຮັບຜິດຊອບ"
                    : "ສະເພາະສິດ Role 2 ເທົ່ານັ້ນ"
                }
              >
                <button
                  onClick={() => router.push(`/responsible?id=${user.id}`)}
                  className="p-2 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={!((user.raw as any).roleId === 2 || (user.raw as any).role?.id === 2)}
                  style={{
                    background: "rgba(var(--brand), 0.1)",
                    color: "rgb(var(--brand))"
                  }}
                  onMouseEnter={(e) => {
                    if ((user.raw as any).roleId === 2 || (user.raw as any).role?.id === 2) {
                      e.currentTarget.style.background = "rgba(var(--brand), 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(var(--brand), 0.1)";
                  }}
                >
                  <UserCog className="w-4 h-4" />
                </button>
              </ButtonTooltip>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    pageCount: totalPages,
    state: {
      globalFilter,
      columnFilters,
      pagination,
    },
    onGlobalFilterChange: (updater) => {
      const nextVal = typeof updater === 'function' ? updater(globalFilter) : updater;
      setGlobalFilter(nextVal);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onColumnFiltersChange: (updater) => {
      const nextVal = typeof updater === 'function' ? updater(columnFilters) : updater;
      setColumnFilters(nextVal);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  const generatePagination = () => {
    const currentPage = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const pages = [];

    if (pageCount <= 5) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(0, 1, 2, 3, "...", pageCount - 1);
      } else if (currentPage >= pageCount - 3) {
        pages.push(0, "...", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1);
      } else {
        pages.push(0, "...", currentPage - 1, currentPage, currentPage + 1, "...", pageCount - 1);
      }
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
            ຜູ້ໃຊ້ງານ
          </h1>
        </div>
        <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
          {/* <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 shadow-sm border" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--success))", color: "rgb(var(--success))" }}><Download className="w-4 h-4" />
            <span className="hidden sm:block">Excel</span>
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 shadow-sm border" style={{ background: "rgb(var(--card))", borderColor: "rgb(var(--danger))", color: "rgb(var(--danger))" }}><Download className="w-4 h-4" />
            <span className="hidden sm:block">PDF</span>
          </button> */}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "rgb(var(--brand))" }}
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync User
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="rounded-2xl overflow-hidden"
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
              placeholder="ຄົ້ນຫາ..."
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
              {totalCount} user{totalCount !== 1 ? "s" : ""}
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-4 sm:px-6 py-4 border-b"
            style={{ borderColor: "rgb(var(--border))", background: "rgba(var(--brand), 0.03)" }}
          >
            <div>
              <Select
                label="Department"
                value={(table.getColumn("department")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("department")?.setFilterValue(e.target.value)}
                options={departmentOptions}
              />
            </div>
            <div>
              <Select
                label="Division"
                value={(table.getColumn("division")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("division")?.setFilterValue(e.target.value)}
                options={divisionOptions}
              />
            </div>
            <div>
              <Select
                label="Position"
                value={(table.getColumn("position")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("position")?.setFilterValue(e.target.value)}
                options={positionOptions}
              />
            </div>
            <div>
              <Select
                label="Role"
                value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("role")?.setFilterValue(e.target.value)}
                options={roleOptions}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
                onChange={(e) => table.getColumn("status")?.setFilterValue(e.target.value)}
                options={statusOptions}
              />
            </div>
            <div className="md:col-span-3 lg:col-span-5 flex justify-end">
              <button
                onClick={() => {
                  setColumnFilters([]);
                  setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                className="text-sm font-medium hover:underline text-brand"
                style={{ color: "rgb(var(--brand))" }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-160">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gradient-to-r from-blue-50/50 via-transparent to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b" style={{ borderColor: "rgb(var(--border))" }}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "rgb(var(--brand))" }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "rgb(var(--brand))" }} />
                      <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                        ກຳລັງໂຫຼດຂໍ້ມູນ...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgb(var(--bg))" }}
                      >
                        <Users className="w-7 h-7" style={{ color: "rgb(var(--text-secondary))" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                          ບໍ່ພົບຜູ້ໃຊ້ງານ
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`transition-colors border-t hover:bg-blue-50/40 dark:hover:bg-blue-900/20 ${index % 2 === 0 ? "bg-transparent" : "bg-gray-50/30 dark:bg-gray-800/20"}`}
                    style={{ borderColor: "rgb(var(--border))" }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {table.getPageCount() > 1 && (
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-4 border-t"
            style={{ borderColor: "rgb(var(--border))" }}
          >
            <span className="text-xs" style={{ color: "rgb(var(--text-secondary))" }}>
              ໜ້າ {table.getState().pagination.pageIndex + 1} ຈາກ {table.getPageCount()}
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
                      background: table.getState().pagination.pageIndex === i ? "rgb(var(--brand))" : "rgb(var(--bg))",
                      border: "1px solid rgb(var(--border))",
                      color: table.getState().pagination.pageIndex === i ? "white" : "rgb(var(--text-secondary))",
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
      <EditUserModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onEdit={handleEdit}
        selectedUser={selectedUser as any}
      />

      {/* ─── RESET PASSWORD MODAL ─── */}
      <Modal open={resetModalOpen} onClose={() => setResetModalOpen(false)} title="ຢືນຢັນການຣີເຊັດລະຫັດຜ່ານ">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
            ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການຣີເຊັດລະຫັດຜ່ານສຳລັບຜູ້ໃຊ້ <strong>{userToReset?.name}</strong>?
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setResetModalOpen(false)} className="flex-1">
              ຍົກເລີກ
            </Button>
            <Button
              variant="primary"
              onClick={handleResetPassword}
              loading={resetting}
              className="flex-1"
              style={{ background: "rgb(239, 68, 68)", borderColor: "rgb(239, 68, 68)" }}
            >
              ຢືນຢັນຣີເຊັດ
            </Button>
          </div>
        </div>
      </Modal>

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
                  a.download = "users_export.pdf";
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
