import { useState } from "react";
import { X, Calendar } from "lucide-react";
import { proposeSchedule } from "../../services/maintenanceWorkflowService";

export default function ScheduleModal({ requestId, onSuccess, onClose }) {
  const [proposedTime, setProposedTime] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposedTime) { setError("Vui lòng chọn thời gian đề xuất"); return; }
    setLoading(true);
    setError(null);
    try {
      await proposeSchedule(requestId, { proposedTime, note });
      onSuccess();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Minimum datetime: now
  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Đề xuất lịch sửa chữa</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Thời gian thực hiện <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={proposedTime}
              min={minDateTime}
              onChange={(e) => setProposedTime(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Ghi chú cho cư dân
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="VD: Kỹ thuật viên sẽ đến vào buổi sáng, vui lòng có mặt tại nhà..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-60">
              {loading ? "Đang gửi..." : "Gửi đề xuất lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
