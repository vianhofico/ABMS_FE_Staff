import { useState } from "react";
import { X, DollarSign, Plus, Trash2 } from "lucide-react";
import { createQuotation, updateQuotation } from "../../services/maintenanceWorkflowService";

export default function QuotationModal({ requestId, existingQuotation, onSuccess, onClose }) {
  const isEditing = !!existingQuotation;
  const [title, setTitle] = useState(existingQuotation?.title ?? "");
  const [note, setNote] = useState(existingQuotation?.note ?? "");
  const [items, setItems] = useState(
    existingQuotation?.items ?? [{ name: "", quantity: 1, unitPrice: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const addItem = () => setItems([...items, { name: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    setItems(items.map((item, i) =>
      i === idx ? { ...item, [field]: field === "name" ? value : Number(value) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề báo giá"); return; }
    if (items.some(i => !i.name.trim())) { setError("Vui lòng nhập tên đầy đủ cho tất cả hạng mục"); return; }

    setLoading(true);
    setError(null);
    try {
      const payload = { title, note, items, totalAmount };
      if (isEditing) {
        await updateQuotation(existingQuotation.id, payload);
      } else {
        await createQuotation(requestId, payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              {isEditing ? "Chỉnh sửa báo giá" : "Tạo báo giá"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Tiêu đề báo giá <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Báo giá sửa điện phòng khách"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Hạng mục <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs text-purple-600 font-semibold hover:underline">
                <Plus size={14} /> Thêm hạng mục
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Tên hạng mục"
                    value={item.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number" min="1"
                    placeholder="SL"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    className="w-16 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                  />
                  <input
                    type="number" min="0"
                    placeholder="Đơn giá"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                    className="w-28 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-purple-50 rounded-xl p-4 flex justify-between items-center">
            <span className="text-sm font-bold text-purple-700">Tổng cộng</span>
            <span className="text-lg font-black text-purple-700">
              {totalAmount.toLocaleString("vi-VN")} đ
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Ghi chú thêm (không bắt buộc)"
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
              className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-60">
              {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo báo giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
