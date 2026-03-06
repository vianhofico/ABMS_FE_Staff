import { LayoutDashboard, Wrench, ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      label: "Đơn được giao",
      value: 12,
      icon: Wrench,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Đang xử lý",
      value: 5,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Hoàn thành",
      value: 6,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Quá hạn",
      value: 1,
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <LayoutDashboard className="w-5 h-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Tổng quan</h1>
        </div>
        <p className="text-sm text-gray-500">Xem nhanh tình trạng công việc được giao của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Yêu cầu gần đây</h2>
        <div className="text-center py-12 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Chưa có yêu cầu nào được giao gần đây</p>
        </div>
      </div>
    </div>
  );
}
