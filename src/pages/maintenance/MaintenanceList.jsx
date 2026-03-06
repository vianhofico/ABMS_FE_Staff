import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench, Search, Filter, ChevronRight,
  Loader2, AlertCircle, Clock, CheckCircle2, XCircle
} from "lucide-react";
import { fetchMaintenanceRequests } from "../../services/maintenanceRequestService";
import StatusBadge from "../../components/maintenance/StatusBadge";

const ALL_STATUSES = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "QUOTING", label: "Đang báo giá" },
  { value: "WAITING_APPROVAL", label: "Chờ duyệt BG" },
  { value: "IN_PROGRESS", label: "Đang sửa" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const PRIORITY_COLOR = {
  CRITICAL: "text-red-600",
  HIGH: "text-orange-500",
  MEDIUM: "text-yellow-600",
  LOW: "text-gray-400",
};

export default function MaintenanceList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const res = await fetchMaintenanceRequests({ pagination: false });
      if (res.code === 200) setRequests(res.result ?? []);
      else setError(res.message ?? "Không thể tải danh sách");
    } catch (err) {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    const matchStatus = filterStatus === "all" || r.requestStatus === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || r.title?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    assigned: requests.length,
    inProgress: requests.filter((r) => r.requestStatus === "IN_PROGRESS").length,
    completed: requests.filter((r) => ["COMPLETED", "RESIDENT_ACCEPTED"].includes(r.requestStatus)).length,
    cancelled: requests.filter((r) => r.requestStatus === "CANCELLED").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Wrench className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yêu cầu bảo trì</h1>
              <p className="text-gray-500 text-sm font-medium">Danh sách yêu cầu được giao cho bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Được giao", value: stats.assigned, icon: Wrench, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Đang sửa", value: stats.inProgress, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Hoàn thành", value: stats.completed, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
            { label: "Đã hủy", value: stats.cancelled, icon: XCircle, color: "text-gray-500", bg: "bg-gray-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm theo tiêu đề hoặc mã yêu cầu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 border-none"
            />
          </div>
          <div className="relative md:w-52">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 border-none appearance-none cursor-pointer"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-6">
            <AlertCircle size={18} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* List */}
        {filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((req) => (
              <button
                key={req.id}
                onClick={() => navigate(`/maintenance/${req.id}`)}
                className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:border-blue-100 transition-all text-left"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{req.title}</p>
                    <span className={`text-xs font-bold flex-shrink-0 ${PRIORITY_COLOR[req.priority] ?? "text-gray-400"}`}>
                      [{req.priority}]
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400">{req.code}</p>
                    {req.apartmentCode && (
                      <p className="text-xs text-gray-400">• {req.apartmentCode}</p>
                    )}
                    {req.residentName && (
                      <p className="text-xs text-gray-400">• {req.residentName}</p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={req.requestStatus} />
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Không có yêu cầu nào</h3>
            <p className="text-gray-400 text-sm">Chưa có yêu cầu nào được giao hoặc không khớp bộ lọc.</p>
          </div>
        )}
      </div>
    </div>
  );
}
