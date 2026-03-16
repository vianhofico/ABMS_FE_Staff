import { useState } from "react";
import { X, DollarSign, Plus, Trash2 } from "lucide-react";
import { createQuotation, updateQuotation } from "../../services/maintenanceWorkflowService";

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function QuotationModal({ requestId, existingQuotation, onSuccess, onClose }) {
  const isEditing = !!existingQuotation;
  const [title, setTitle] = useState(existingQuotation?.title ?? "");
  const [description, setDescription] = useState(existingQuotation?.description ?? "");
  const [note, setNote] = useState(existingQuotation?.note ?? "");
  const [validUntil, setValidUntil] = useState(toDateTimeLocal(existingQuotation?.validUntil));
  const [items, setItems] = useState(
    existingQuotation?.items ?? [{ name: "", itemType: "MATERIAL", quantity: 1, unitPrice: 0 }]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const addItem = () => setItems([...items, { name: "", itemType: "MATERIAL", quantity: 1, unitPrice: 0 }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx, field, value) => {
    setItems(items.map((item, i) => {
      if (i !== idx) return item;
      if (field === "name" || field === "itemType") return { ...item, [field]: value };
      return { ...item, [field]: Number(value) };
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề báo giá"); return; }
    if (validUntil && new Date(validUntil) <= new Date()) {
      setError("Hạn hiệu lực phải lớn hơn thời điểm hiện tại");
      return;
    }
    if (items.some(i => !i.name.trim())) { setError("Vui lòng nhập tên đầy đủ cho tất cả hạng mục"); return; }
    if (items.some(i => !i.itemType)) { setError("Vui lòng chọn loại hạng mục cho tất cả dòng"); return; }
    if (items.some(i => !Number.isInteger(Number(i.quantity)) || Number(i.quantity) <= 0)) {
      setError("Số lượng phải là số nguyên lớn hơn 0");
      return;
    }
    if (items.some(i => Number(i.unitPrice) <= 0)) {
      setError("Đơn giá phải lớn hơn 0");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        note: note.trim() || null,
        validUntil: validUntil || null,
        items: items.map((item) => ({
          name: item.name.trim(),
          itemType: item.itemType,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[92vh] max-h-[92vh] overflow-hidden flex flex-col">
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

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 p-6 space-y-5 overflow-y-auto overscroll-contain">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Tiêu đề báo giá <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Tên ngắn gọn của báo giá để cư dân dễ nhận biết (ví dụ: Sửa điện phòng khách).
                </p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Báo giá sửa điện phòng khách"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Hiệu lực đến
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Thời hạn cư dân có thể phản hồi báo giá. Để trống nếu không giới hạn.
                </p>
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Mô tả nội bộ
                </label>
                <p className="text-[11px] text-gray-400 mb-2">
                  Ghi chú kỹ thuật cho nội bộ vận hành, không bắt buộc gửi cho cư dân.
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả thêm cho đội kỹ thuật"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Hạng mục <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Mỗi dòng là 1 chi phí: tên hạng mục, loại chi phí, số lượng và đơn giá.
                  </p>
                </div>
                <button type="button" onClick={addItem}
                  className="flex items-center gap-1 text-xs text-purple-600 font-semibold hover:underline whitespace-nowrap">
                  <Plus size={14} /> Thêm hạng mục
                </button>
              </div>

              <div className="hidden md:grid md:grid-cols-[2fr_1.2fr_0.7fr_1fr_auto] gap-2 px-1 mb-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase">Tên hạng mục</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase">Loại chi phí</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase">SL</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase">Đơn giá</p>
                <p className="text-[11px] font-semibold text-gray-500 uppercase">Xóa</p>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1.2fr_0.7fr_1fr_auto] gap-2 items-center">
                      <input
                        type="text"
                        placeholder="VD: Dây điện Cadivi 2.5"
                        value={item.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <select
                        value={item.itemType || "MATERIAL"}
                        onChange={(e) => updateItem(idx, "itemType", e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="MATERIAL">Vật tư</option>
                        <option value="LABOR">Nhân công</option>
                        <option value="OUTSOURCE">Thuê ngoài</option>
                      </select>
                      <input
                        type="number" min="1"
                        placeholder="SL"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center"
                      />
                      <input
                        type="number" min="0.01" step="0.01"
                        placeholder="Đơn giá"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex justify-end">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">
                      Thành tiền dòng này: {(item.quantity * item.unitPrice).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <span className="text-sm font-bold text-purple-700">Tổng cộng</span>
                <p className="text-[11px] text-purple-500 mt-1">
                  Hệ thống sẽ tính tự động từ toàn bộ hạng mục.
                </p>
              </div>
              <span className="text-lg font-black text-purple-700">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Ghi chú gửi cư dân</label>
              <p className="text-[11px] text-gray-400 mb-2">
                Nội dung giải thích thêm cho cư dân như phạm vi công việc, thời gian dự kiến, cam kết.
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Ghi chú thêm (không bắt buộc)"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
            )}
          </div>

          <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 disabled:opacity-60">
                {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo báo giá"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
