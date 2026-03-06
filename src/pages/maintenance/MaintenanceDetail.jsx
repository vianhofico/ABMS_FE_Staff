import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Wrench, FileText, DollarSign, TrendingUp,
  Calendar, MessageSquare, Loader2, AlertCircle, CheckCircle2,
  Clock, User, Building, Send, Edit2, History, Plus
} from "lucide-react";
import { fetchMaintenanceRequestDetail } from "../../services/maintenanceRequestService";
import {
  fetchMaintenanceQuotations, updateQuotationStatus,
  fetchSchedules, respondToSchedule,
  fetchMaintenanceProgress, fetchResources,
  fetchMaintenanceLogs,
} from "../../services/maintenanceWorkflowService";
import StatusBadge from "../../components/maintenance/StatusBadge";
import QuotationModal from "../../components/maintenance/QuotationModal";
import ProgressModal from "../../components/maintenance/ProgressModal";
import ScheduleModal from "../../components/maintenance/ScheduleModal";

// ─── helpers ─────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString("vi-VN") : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";

const PRIORITY_COLOR = {
  CRITICAL: "text-red-600", HIGH: "text-orange-500",
  MEDIUM: "text-yellow-600", LOW: "text-gray-400",
};

const TABS = [
  { id: "detail",    label: "Chi tiết",  icon: FileText     },
  { id: "quotation", label: "Báo giá",   icon: DollarSign   },
  { id: "progress",  label: "Tiến độ",   icon: TrendingUp   },
  { id: "schedule",  label: "Lịch",      icon: Calendar     },
  { id: "logs",      label: "Nhật ký",   icon: MessageSquare},
];

// ─── Page ─────────────────────────────────────────────────────
export default function MaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request,    setRequest]    = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [schedules,  setSchedules]  = useState([]);
  const [progress,   setProgress]   = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState("detail");

  // Modals
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [editingQuotation,   setEditingQuotation]   = useState(null); // quotation obj for edit
  const [showProgressModal,  setShowProgressModal]  = useState(false);
  const [showScheduleModal,  setShowScheduleModal]  = useState(false);
  const [actionLoading,      setActionLoading]      = useState(false);

  useEffect(() => { loadAll(); }, [id]);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, quoRes, schRes, proRes, logRes] = await Promise.all([
        fetchMaintenanceRequestDetail(id),
        fetchMaintenanceQuotations(id),
        fetchSchedules(id),
        fetchMaintenanceProgress(id),
        fetchMaintenanceLogs(id),
      ]);
      if (reqRes.code === 200) setRequest(reqRes.result);
      if (quoRes.code === 200) setQuotations(quoRes.result ?? []);
      if (schRes.code === 200) setSchedules(schRes.result ?? []);
      if (proRes.code === 200) setProgress(proRes.result ?? []);
      if (logRes.code === 200) setLogs(logRes.result ?? []);
    } catch (err) {
      setError("Không thể tải thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuotation = async (quotationId) => {
    if (!window.confirm("Gửi báo giá này cho cư dân?")) return;
    setActionLoading(true);
    try {
      await updateQuotationStatus(quotationId, "SENT");
      loadAll();
    } catch { alert("Có lỗi khi gửi báo giá"); }
    finally { setActionLoading(false); }
  };

  const handleRespondToSchedule = async (scheduleId, action) => {
    setActionLoading(true);
    try {
      await respondToSchedule(id, scheduleId, { action });
      loadAll();
    } catch { alert("Có lỗi khi phản hồi lịch"); }
    finally { setActionLoading(false); }
  };

  // ── Derived ──
  const latestProgress   = progress[0] ?? null;
  const progressPct      = latestProgress?.progressPercent ?? 0;
  const pendingSchedule  = schedules.find((s) => s.status === "PROPOSED" && s.proposedByRole === "RESIDENT");

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p className="text-gray-500 font-medium">Đang tải...</p>
    </div>
  );

  if (!request) return (
    <div className="p-8 text-center">
      <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
      <h2 className="text-lg font-bold mb-2">Không tìm thấy yêu cầu</h2>
      <button onClick={() => navigate("/maintenance")} className="text-blue-600 text-sm">Quay lại</button>
    </div>
  );

  // ── Actions available for staff based on status ──
  const canCreateQuotation = ["QUOTING", "IN_PROGRESS"].includes(request.requestStatus);
  const canUpdateProgress  = ["IN_PROGRESS", "QUOTING"].includes(request.requestStatus);
  const canProposeSchedule = ["IN_PROGRESS", "APPROVED"].includes(request.requestStatus);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/maintenance")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900">{request.title}</h1>
                <StatusBadge status={request.requestStatus} />
              </div>
              <p className="text-xs text-gray-400 font-medium">Mã: {request.code}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-6 overflow-x-auto">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              onClick={() => setActiveTab(tid)}
              className={`flex items-center gap-1.5 py-4 border-b-2 font-bold text-sm px-1 whitespace-nowrap transition-all ${
                activeTab === tid
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={15} />
              {label}
              {tid === "quotation" && quotations.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tid ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {quotations.length}
                </span>
              )}
              {tid === "progress" && progress.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tid ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                  {progress.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left: Main Content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* ══ TAB: DETAIL ══ */}
          {activeTab === "detail" && (
            <>
              {/* Staff Action: pending schedule proposed by RESIDENT */}
              {pendingSchedule && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 bg-yellow-500 rounded-xl flex items-center justify-center text-white">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-900 text-sm">Cư dân đề xuất lịch</h3>
                      <p className="text-xs text-yellow-600">Vui lòng xác nhận hoặc đổi lịch</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-4 mb-3 border border-yellow-100">
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-900">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={15} className="text-yellow-500" />
                        {fmtDate(pendingSchedule.proposedTime)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-yellow-500" />
                        {fmtTime(pendingSchedule.proposedTime)}
                      </span>
                    </div>
                    {pendingSchedule.note && <p className="text-xs text-gray-500 mt-2 italic">"{pendingSchedule.note}"</p>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespondToSchedule(pendingSchedule.id, "ACCEPT")}
                      className="flex-1 bg-yellow-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-600 transition-all disabled:opacity-60"
                    >
                      Chấp nhận lịch
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => { setShowScheduleModal(true); }}
                      className="flex-1 bg-white text-yellow-600 border border-yellow-200 py-2.5 rounded-xl text-sm font-bold hover:bg-yellow-50 transition-all"
                    >
                      Đề xuất lịch khác
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Mô tả vấn đề</h3>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{request.description}</p>
              </div>

              {/* Staff quick actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {canCreateQuotation && (
                  <button
                    onClick={() => { setEditingQuotation(null); setShowQuotationModal(true); }}
                    className="flex items-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:bg-purple-700 transition-all justify-center"
                  >
                    <Plus size={16} /> Tạo báo giá
                  </button>
                )}
                {canUpdateProgress && (
                  <button
                    onClick={() => setShowProgressModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-all justify-center"
                  >
                    <TrendingUp size={16} /> Cập nhật tiến độ
                  </button>
                )}
                {canProposeSchedule && !pendingSchedule && (
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="flex items-center gap-2 bg-green-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md hover:bg-green-700 transition-all justify-center"
                  >
                    <Calendar size={16} /> Đề xuất lịch
                  </button>
                )}
              </div>
            </>
          )}

          {/* ══ TAB: QUOTATION ══ */}
          {activeTab === "quotation" && (
            <div className="space-y-4">
              {canCreateQuotation && (
                <button
                  onClick={() => { setEditingQuotation(null); setShowQuotationModal(true); }}
                  className="flex items-center gap-2 bg-purple-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-purple-700 transition-all"
                >
                  <Plus size={16} /> Tạo báo giá mới
                </button>
              )}
              {quotations.length > 0 ? quotations.map((q) => (
                <div key={q.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{q.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Tạo: {fmt(q.createdAt)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      q.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      q.status === "SENT"     ? "bg-blue-100 text-blue-700" :
                      q.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {q.status}
                    </span>
                  </div>

                  {/* Items */}
                  {q.items?.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {q.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} × {item.quantity}</span>
                          <span className="font-medium">{(item.unitPrice * item.quantity).toLocaleString("vi-VN")} đ</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-lg font-black text-purple-600">{q.totalAmount?.toLocaleString("vi-VN")} đ</span>
                  </div>
                  {q.note && <p className="text-xs text-gray-500 italic mb-4">"{q.note}"</p>}

                  {/* Actions: only if DRAFT */}
                  {q.status === "DRAFT" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingQuotation(q); setShowQuotationModal(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50"
                      >
                        <Edit2 size={14} /> Chỉnh sửa
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleSendQuotation(q.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60"
                      >
                        <Send size={14} /> Gửi cho cư dân
                      </button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 text-gray-400">
                  Chưa có báo giá nào.
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: PROGRESS ══ */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              {canUpdateProgress && (
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
                >
                  <Plus size={16} /> Cập nhật tiến độ mới
                </button>
              )}
              <div className="relative pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {progress.length > 0 ? progress.map((p, idx) => (
                  <div key={p.id} className="relative">
                    <div className={`absolute -left-8 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${idx === 0 ? "bg-blue-600" : "bg-blue-300"}`}>
                      {idx === 0 && <CheckCircle2 size={12} className="text-white" />}
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-900">{p.progressPercent}% Hoàn thành</span>
                        <span className="text-[10px] font-medium text-gray-400">{fmt(p.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{p.note}</p>
                    </div>
                  </div>
                )) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 text-gray-400 ml-[-2rem]">
                    Chưa có cập nhật tiến độ nào.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ TAB: SCHEDULE ══ */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {canProposeSchedule && (
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center gap-2 bg-green-600 text-white py-2.5 px-4 rounded-xl font-bold text-sm hover:bg-green-700 transition-all"
                >
                  <Plus size={16} /> Đề xuất lịch mới
                </button>
              )}
              {schedules.length > 0 ? schedules.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-green-600" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {fmtDate(s.proposedTime)} lúc {fmtTime(s.proposedTime)}
                        </p>
                        <p className="text-xs text-gray-400">Đề xuất bởi: {s.proposedByRole === "STAFF" ? "Nhân viên" : "Cư dân"}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase ${
                      s.status === "ACCEPTED"  ? "bg-green-100 text-green-700" :
                      s.status === "REJECTED"  ? "bg-red-100 text-red-700" :
                      s.status === "PROPOSED"  ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{s.status}</span>
                  </div>
                  {s.note && <p className="text-xs text-gray-500 italic">"{s.note}"</p>}
                  {/* If resident proposed and pending — offer ACCEPT / new propose */}
                  {s.status === "PROPOSED" && s.proposedByRole === "RESIDENT" && (
                    <div className="flex gap-2 mt-4">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleRespondToSchedule(s.id, "ACCEPT")}
                        className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-60"
                      >
                        Chấp nhận
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleRespondToSchedule(s.id, "REJECT")}
                        className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-xl text-sm font-bold hover:bg-red-50"
                      >
                        Từ chối
                      </button>
                    </div>
                  )}
                </div>
              )) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200 text-gray-400">
                  Chưa có lịch nào được đề xuất.
                </div>
              )}
            </div>
          )}

          {/* ══ TAB: LOGS ══ */}
          {activeTab === "logs" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Hoạt động</th>
                    <th className="px-6 py-4">Người thực hiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length > 0 ? logs.map((log) => (
                    <tr key={log.id} className="text-sm">
                      <td className="px-6 py-4 text-gray-400 whitespace-nowrap">{fmt(log.createdAt)}</td>
                      <td className="px-6 py-4 font-bold text-gray-700">{log.action}</td>
                      <td className="px-6 py-4 text-gray-500">{log.actorName || "Hệ thống"}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-400 text-sm">Chưa có hoạt động nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Right: Sidebar Info ── */}
        <div className="space-y-6">
          {/* Progress summary */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
            <h3 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">Tiến độ</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-black">{progressPct}%</div>
              <div className="flex-1">
                <div className="h-2 bg-blue-400/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
            <p className="text-sm font-medium text-blue-100 leading-relaxed">
              {latestProgress?.note ?? "Chưa có cập nhật tiến độ."}
            </p>
          </div>

          {/* Request info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Thông tin yêu cầu</h3>
            <div className="space-y-4">
              {[
                { icon: Building, label: "Căn hộ", value: `${request.apartmentCode ?? "—"} · ${request.buildingName ?? "—"}` },
                { icon: User,     label: "Cư dân",  value: request.residentName ?? "—" },
                { icon: Clock,    label: "Mong muốn", value: fmt(request.preferredTime) },
                { icon: AlertCircle, label: "Ưu tiên", value: request.priority,
                  valueClass: PRIORITY_COLOR[request.priority] ?? "text-gray-700" },
              ].map(({ icon: Icon, label, value, valueClass }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className={`text-sm font-bold ${valueClass ?? "text-gray-900"}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showQuotationModal && (
        <QuotationModal
          requestId={id}
          existingQuotation={editingQuotation}
          onSuccess={() => { setShowQuotationModal(false); setEditingQuotation(null); loadAll(); }}
          onClose={() => { setShowQuotationModal(false); setEditingQuotation(null); }}
        />
      )}
      {showProgressModal && (
        <ProgressModal
          requestId={id}
          currentPercent={progressPct}
          onSuccess={() => { setShowProgressModal(false); loadAll(); }}
          onClose={() => setShowProgressModal(false)}
        />
      )}
      {showScheduleModal && (
        <ScheduleModal
          requestId={id}
          onSuccess={() => { setShowScheduleModal(false); loadAll(); }}
          onClose={() => setShowScheduleModal(false)}
        />
      )}
    </div>
  );
}
