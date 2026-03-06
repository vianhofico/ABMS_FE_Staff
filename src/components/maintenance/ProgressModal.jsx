import { useState } from "react";
import { X, TrendingUp } from "lucide-react";
import { addProgress } from "../../services/maintenanceWorkflowService";

export default function ProgressModal({ requestId, currentPercent = 0, onSuccess, onClose }) {
  const [percent, setPercent] = useState(currentPercent);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) { setError("Vui lòng nhập ghi chú tiến độ"); return; }
    setLoading(true);
    setError(null);
    try {
      await addProgress(requestId, { progressPercent: percent, note });
      onSuccess();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">Cập nhật tiến độ</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Percent slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tiến độ hoàn thành
              </label>
              <span className="text-lg font-black text-blue-600">{percent}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="5"
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            {percent === 100 && (
              <p className="text-xs text-green-600 font-semibold mt-2">
                ✅ Đặt 100% sẽ tự động chuyển sang trạng thái <strong>COMPLETED</strong>
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Mô tả công việc đã làm <span className="text-red-500">*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="VD: Đã kiểm tra và thay thế bộ công tắc, test hoạt động bình thường..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60">
              {loading ? "Đang lưu..." : "Cập nhật tiến độ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
