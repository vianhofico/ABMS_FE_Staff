import {
  LayoutDashboard,
  Wrench,
  ClipboardList,
  Calendar,
  BarChart2,
  User,
} from "lucide-react";

export const staffNav = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Yêu cầu bảo trì",
    icon: Wrench,
    path: "/maintenance",
  },
  {
    label: "Báo giá",
    icon: ClipboardList,
    path: "/quotations",
  },
  {
    label: "Lịch làm việc",
    icon: Calendar,
    path: "/schedules",
  },
  {
    label: "Thống kê",
    icon: BarChart2,
    path: "/statistics",
  },
  {
    label: "Hồ sơ",
    icon: User,
    path: "/profile",
  },
];
