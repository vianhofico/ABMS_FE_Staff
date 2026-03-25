import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Wrench, FileText, DollarSign, TrendingUp,
  Calendar, Loader2, AlertCircle, CheckCircle2,
  Clock, User, Building, MapPin, Send, Edit2, History, Plus, Paperclip
} from "lucide-react";
import { fetchMaintenanceRequestDetail } from "../../services/maintenanceRequestService";
import {
  fetchMaintenanceQuotations, updateQuotationStatus,
  fetchSchedules, respondToSchedule,
  fetchMaintenanceProgress, fetchResources, addResource,
} from "../../services/maintenanceWorkflowService";
import { uploadFile } from "../../services/fileService";
import { mapResourcePreview } from "../../utils/resourcePreview";
import StatusBadge from "../../components/maintenance/StatusBadge";
import QuotationModal from "../../components/maintenance/QuotationModal";
import ProgressModal from "../../components/maintenance/ProgressModal";
import ScheduleModal from "../../components/maintenance/ScheduleModal";
import toast from "react-hot-toast";

const toastConfirm = (message, confirmText = "Đồng ý", cancelText = "Hủy") =>
  new Promise((resolve) => {
    const id = toast.custom(
      (t) => (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-[340px]">
          <p className="text-sm text-gray-800 font-medium">{message}</p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      { id: `confirm-${Date.now()}`, duration: Infinity }
    );

    return id;
  });

// ─── helpers ─────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleString("vi-VN") : "—";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "—";
const isExpired = (d) => d ? new Date(d) <= new Date() : false;
const quoteTotal = (q) => {
  if (typeof q.totalAmount === "number") return q.totalAmount;
  return (q.items ?? []).reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
};

const PRIORITY_COLOR = {
  CRITICAL: "text-red-600", HIGH: "text-orange-500",
  NORMAL: "text-yellow-600",
  MEDIUM: "text-yellow-600", LOW: "text-gray-400",
};

const PRIORITY_LABEL = {
  CRITICAL: "Khẩn cấp",
  HIGH: "Cao",
  NORMAL: "Bình thường",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

const SCOPE_LABEL = {
  PUBLIC: "Công cộng",
  PRIVATE: "Riêng tư",
};

const QUOTATION_STATUS_MAP = {
  DRAFT: "Nháp",
  SENT: "Đã gửi",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
  CANCELLED: "Đã hủy",
  EXPIRED: "Hết hạn",
};

const SCHEDULE_STATUS_MAP = {
  PROPOSED: "Đề xuất",
  ACCEPTED: "Đã chấp nhận",
  REJECTED: "Bị từ chối",
  CONFIRMED: "Đã xác nhận",
  COUNTER_PROPOSED: "Đề xuất lại",
  CANCELLED: "Đã hủy",
};

const TABS = [
  { id: "detail",    label: "Chi tiết",  icon: FileText     },
  { id: "quotation", label: "Báo giá",   icon: DollarSign   },
  { id: "progress",  label: "Tiến độ",   icon: TrendingUp   },
  { id: "schedule",  label: "Lịch",      icon: Calendar     },
];

// ─── Page ─────────────────────────────────────────────────────
export default function MaintenanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request,    setRequest]    = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [schedules,  setSchedules]  = useState([]);
  const [progress,   setProgress]   = useState([]);
  const [resources,  setResources]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState("detail");

  // Modals
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [editingQuotation,   setEditingQuotation]   = useState(null); // quotation obj for edit
  const [showProgressModal,  setShowProgressModal]  = useState(false);
  const [showScheduleModal,  setShowScheduleModal]  = useState(false);
  const [actionLoading,      setActionLoading]      = useState(false);
  const [uploadingResource,  setUploadingResource]  = useState(false);
  const [selectedResourceFiles, setSelectedResourceFiles] = useState([]);
  const selectedResourceFilesRef = useRef([]);
  const resourceInputRef = useRef(null);

  useEffect(() => { loadAll(); }, [id]);

  useEffect(() => {
    selectedResourceFilesRef.current = selectedResourceFiles;
  }, [selectedResourceFiles]);

  useEffect(() => {
    return () => {
      selectedResourceFilesRef.current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, []);

  const handleResourceFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const mapped = files.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      isImage: file.type.startsWith("image/"),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));

    setSelectedResourceFiles((prev) => {
      const combined = [...prev, ...mapped].slice(0, 10);
      const keepIds = new Set(combined.map((item) => item.id));

      [...prev, ...mapped].forEach((item) => {
        if (!keepIds.has(item.id) && item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      return combined;
    });

    event.target.value = "";
  };

  const removeSelectedResource = (id) => {
    setSelectedResourceFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const openResourcePicker = () => {
    resourceInputRef.current?.click();
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reqRes, quoRes, schRes, proRes, resRes] = await Promise.all([
        fetchMaintenanceRequestDetail(id),
        fetchMaintenanceQuotations(id),
        fetchSchedules(id),
        fetchMaintenanceProgress(id),
        fetchResources(id),
      ]);
      if (reqRes.code === 200) setRequest(reqRes.result);
      if (quoRes.code === 200) setQuotations(quoRes.result ?? []);
      if (schRes.code === 200) setSchedules(schRes.result ?? []);
      if (proRes.code === 200) setProgress(proRes.result ?? []);
      if (resRes.code === 200) setResources(resRes.result ?? []);
    } catch (err) {
      setError("Không thể tải thông tin chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuotation = async (quotationId) => {
    const confirmed = await toastConfirm("Gửi báo giá này cho cư dân?", "Gửi", "Hủy");
    if (!confirmed) return;
    setActionLoading(true);
    try {
      await updateQuotationStatus(quotationId, "SENT");
      loadAll();
    } catch { toast.error("Có lỗi khi gửi báo giá"); }
    finally { setActionLoading(false); }
  };

  const handleRespondToSchedule = async (scheduleId, action) => {
    setActionLoading(true);
    try {
      await respondToSchedule(id, scheduleId, { action });
      loadAll();
    } catch { toast.error("Có lỗi khi phản hồi lịch"); }
    finally { setActionLoading(false); }
  };

  const handleUploadResource = async () => {
    if (!selectedResourceFiles.length) return;
    setUploadingResource(true);
    try {
      for (const item of selectedResourceFiles) {
        const uploadRes = await uploadFile(item.file, "maintenance");
        const uploaded = uploadRes?.result;
        if (!uploaded?.url) throw new Error("Upload failed");

        await addResource(id, {
          name: item.file.name,
          url: uploaded.url,
          resourceType: item.file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
        });
      }

      selectedResourceFiles.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      setSelectedResourceFiles([]);
      loadAll();
    } catch {
      toast.error("Không thể upload tài nguyên");
    } finally {
      setUploadingResource(false);
    }
  };

  // ── Derived ──
  const latestProgress   = progress[0] ?? null;
  const progressPct      = latestProgress?.progressPercent ?? 0;
  const pendingSchedule  = schedules.find((s) => s.status === "PROPOSED" && s.proposedByRole === "RESIDENT");
  const resourcePreviews = resources
    .map(mapResourcePreview)
    .filter((item) => item.resolvedUrl && item.isImage);

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
  const canCreateQuotation = ["VERIFYING", "QUOTING"].includes(request.requestStatus);
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

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Tài nguyên trước/sau sửa chữa</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                  <input
                    ref={resourceInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleResourceFileChange}
                    className="hidden"
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={openResourcePicker}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openResourcePicker();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-sm cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 text-gray-600 min-w-0">
                      <Paperclip size={16} className="text-indigo-500" />
                      <span className="font-medium truncate">
                        {selectedResourceFiles.length > 0
                          ? `Đã chọn ${selectedResourceFiles.length} file`
                          : "Bấm để chọn ảnh/tài liệu"}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs whitespace-nowrap">
                      Chọn file
                    </span>
                  </div>
                  <button
                    onClick={handleUploadResource}
                    disabled={!selectedResourceFiles.length || uploadingResource}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-60"
                  >
                    <Paperclip size={14} />
                    {uploadingResource ? "Đang upload..." : "Đính kèm"}
                  </button>
                </div>

                {selectedResourceFiles.length > 0 && (
                  <div className="mb-4 border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Xem trước file sắp upload</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedResourceFiles.map((item) => (
                        <div key={item.id} className="relative border border-gray-200 rounded-lg p-2 bg-white">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.file.name}
                              className="w-full h-28 object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-28 rounded-md border border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                              <FileText size={24} />
                            </div>
                          )}
                          <p className="mt-2 text-xs font-medium text-gray-700 truncate">{item.file.name}</p>
                          <button
                            type="button"
                            onClick={() => removeSelectedResource(item.id)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-xs"
                            aria-label="Remove selected file"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resourcePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {resourcePreviews.map((resource) => (
                      <a
                        key={resource.id}
                        href={resource.resolvedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="relative block border border-gray-200 rounded-xl overflow-hidden hover:opacity-90 transition"
                      >
                        <span
                          className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                            resource.uploaderRole === "STAFF"
                              ? "bg-sky-700/90"
                              : resource.uploaderRole === "RESIDENT"
                                ? "bg-emerald-700/90"
                                : "bg-gray-700/85"
                          }`}
                        >
                          {resource.uploaderRole === "STAFF"
                            ? "Nhân viên"
                            : resource.uploaderRole === "RESIDENT"
                              ? "Cư dân"
                              : "Không rõ"}
                        </span>
                        <img
                          src={resource.resolvedUrl}
                          alt="maintenance"
                          className="w-full h-36 object-cover"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Chưa có tài nguyên nào được đính kèm.</p>
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
                  {isExpired(q.validUntil) && q.status === "SENT" && (
                    <div className="mb-3 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                      Báo giá này đã quá hạn hiệu lực.
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{q.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Tạo: {fmt(q.createdAt)}</p>
                      {q.validUntil && (
                        <p className={`text-xs mt-1 ${isExpired(q.validUntil) ? "text-red-500" : "text-gray-500"}`}>
                          Hiệu lực đến: {fmt(q.validUntil)}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      q.status === "APPROVED" ? "bg-green-100 text-green-700" :
                      q.status === "SENT"     ? "bg-blue-100 text-blue-700" :
                      q.status === "REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {QUOTATION_STATUS_MAP[q.status] || q.status}
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
                    <span className="text-lg font-black text-purple-600">{quoteTotal(q).toLocaleString("vi-VN")} đ</span>
                  </div>
                  {q.description && <p className="text-xs text-gray-600 mb-2">Nội bộ: {q.description}</p>}
                  {q.note && <p className="text-xs text-gray-500 italic mb-4">"{q.note}"</p>}

                  {q.status === "DRAFT" && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          disabled={actionLoading}
                          onClick={() => { setEditingQuotation(q); setShowQuotationModal(true); }}
                          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-60"
                        >
                          <Edit2 size={14} /> Chỉnh sửa
                        </button>
                        <button
                          disabled={actionLoading || isExpired(q.validUntil)}
                          onClick={() => handleSendQuotation(q.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60"
                          title={isExpired(q.validUntil) ? "Báo giá đã hết hạn hiệu lực" : "Gửi báo giá cho cư dân"}
                        >
                          <Send size={14} /> Gửi cho cư dân
                        </button>
                      </div>
                      {isExpired(q.validUntil) && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                          Bản nháp đã hết hạn, vui lòng chỉnh hạn hiệu lực trước khi gửi.
                        </p>
                      )}
                    </div>
                  )}

                  {q.status === "SENT" && (
                    <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 font-semibold">
                      Đã gửi cho cư dân. Chờ phản hồi duyệt báo giá.
                    </div>
                  )}

                  {q.status === "APPROVED" && (
                    <div className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 font-semibold">
                      Báo giá đã được cư dân phê duyệt.
                    </div>
                  )}

                  {q.status === "REJECTED" && (
                    <div className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 font-semibold">
                      Báo giá đã bị từ chối. Bạn có thể tạo báo giá mới để gửi lại.
                    </div>
                  )}

                  {q.status === "CANCELLED" && (
                    <div className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-semibold">
                      Báo giá đã bị hủy và không thể thao tác thêm.
                    </div>
                  )}

                  {q.status === "EXPIRED" && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 font-semibold">
                      Báo giá đã hết hạn. Vui lòng tạo báo giá mới nếu cần.
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
                    }`}>{SCHEDULE_STATUS_MAP[s.status] || s.status}</span>
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
                { icon: Building, label: request.scope === "PUBLIC" ? "Tòa nhà" : "Căn hộ", value: request.scope === "PUBLIC" ? (request.buildingName ?? "—") : `${request.apartmentCode ?? "—"} · ${request.buildingName ?? "—"}` },
                { icon: User,     label: "Cư dân",  value: request.requesterName ?? request.residentName ?? "—" },
                { icon: MapPin,   label: "Phạm vi", value: SCOPE_LABEL[request.scope] ?? request.scope ?? "—" },
                { icon: Clock,    label: "Mong muốn", value: fmt(request.preferredTime ?? request.desiredTime) },
                { icon: AlertCircle, label: "Ưu tiên", value: PRIORITY_LABEL[request.priority] ?? request.priority,
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
