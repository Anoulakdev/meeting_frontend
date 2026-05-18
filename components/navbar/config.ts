"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  Layers,
  LayoutTemplate,
  Box,
  FileText,
  CalendarDays,
  FolderOpen,
  File,
  FileX,
  LogIn,
  UserPlus,
  KeyRound,
  Component,
  CheckSquare,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";

export type NavChild = { label: string; href: string; icon: React.ElementType; description?: string };
export type NavItem =
  | { label: string; href: string; icon: React.ElementType; children?: never }
  | { label: string; href?: never; icon: React.ElementType; children: NavChild[] };

// const ALL_NAV_ITEMS: NavItem[] = [
//   { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
//   { label: "ເອກະສານ", href: "/users", icon: Users },
//   { label: "Orders", href: "/orders", icon: ShoppingCart },
//   { label: "Analytics", href: "/analytics", icon: BarChart3 },
//   {
//     label: "Forms",
//     icon: FileText,
//     children: [
//       { label: "Form Elements", href: "/formelements", icon: Layers, description: "Inputs, selects, buttons & more" },
//       { label: "Form Layout", href: "/formlayout", icon: LayoutTemplate, description: "Complete form page examples" },
//     ],
//   },
//   {
//     label: "Components",
//     icon: Box,
//     children: [
//       { label: "Core Elements", href: "/uielements", icon: Component, description: "Buttons, badges, alerts & cards" },
//       { label: "Tasks", href: "/task", icon: CheckSquare, description: "Task management and tracking" },
//       { label: "Calendar", href: "/calendar", icon: CalendarDays, description: "Interactive calendar & events" },
//       { label: "File Manager", href: "/filemanager", icon: FolderOpen, description: "Browse and manage files" },
//       { label: "Blank Page", href: "/blank", icon: File, description: "Empty page starter template" },
//       { label: "404 Error", href: "/error404", icon: FileX, description: "Page not found example" },
//       { label: "Sign In", href: "/signin", icon: LogIn, description: "Login page template" },
//       { label: "Sign Up", href: "/signup", icon: UserPlus, description: "Registration page template" },
//       { label: "Reset Password", href: "/resetpassword", icon: KeyRound, description: "Password recovery flow" },
//     ],
//   },
//   { label: "Settings", href: "/settings", icon: Settings },
// ];

const SUPERADMIN_NAV_ITEMS: NavItem[] = [
  { label: "ໜ້າຫຼັກ", href: "/dashboard", icon: LayoutDashboard },
  { label: "ຜູ້ໃຊ້ງານ", href: "/users", icon: Users },
  { label: "sync ຂໍ້ມູນ", href: "/syncdata", icon: Users },
];

export function useNavItems() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          const roleId = data?.roleId;
          if (roleId === 1) {
            setNavItems(SUPERADMIN_NAV_ITEMS);
          } else if (roleId === 2) {
            setNavItems([]); // Empty array for roleId = 2 as requested for future use
          } else {
            setNavItems([]);
          }
        } else {
          setNavItems([]);
        }
      } catch (error) {
        setNavItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return { navItems, loading };
}

export const noticesData = [
  {
    id: 1,
    type: "warning",
    icon: AlertCircle,
    title: "System Update",
    message: "New server update available",
    time: "5m ago",
    color: "245 158 11",
  },
  {
    id: 2,
    type: "success",
    icon: CheckCircle,
    title: "Order Completed",
    message: "Order #12345 has been shipped",
    time: "1h ago",
    color: "34 197 94",
  },
  {
    id: 3,
    type: "info",
    icon: Info,
    title: "New User Signup",
    message: "5 new users registered today",
    time: "2h ago",
    color: "61 109 255",
  },
  {
    id: 4,
    type: "warning",
    icon: AlertCircle,
    title: "Low Inventory",
    message: "Product ABC123 stock is low",
    time: "3h ago",
    color: "239 68 68",
  },
];
