import { Bell, ChevronDown, Building2, LogOut, User, Settings, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: "Yêu cầu mới được giao cho bạn", time: "30 phút trước", unread: true },
    { id: 2, title: "Báo giá #BG-001 đã được cư dân duyệt", time: "2 giờ trước", unread: true },
    { id: 3, title: "Lịch sửa chữa lúc 14:00 hôm nay", time: "3 giờ trước", unread: false },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="bg-blue-600 h-16 flex items-center px-6 shadow-lg z-50 fixed top-0 left-0 right-0">
      <div className="flex items-center justify-between w-full">

        {/* Left: Logo + App name */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-bold text-[15px] tracking-wide">Building Management</p>
            <p className="text-blue-200 text-[11px]">Hệ thống quản lý tòa nhà</p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setDropdownOpen(false); }}
              className="relative p-2.5 rounded-xl hover:bg-blue-500 transition-all"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-400 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-blue-600">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-gray-800 text-sm">Thông báo</p>
                    <button onClick={() => setNotifOpen(false)}>
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  <div>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all flex gap-3 items-start ${n.unread ? "bg-blue-50/60" : ""}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.unread ? "bg-blue-500" : "bg-gray-300"}`} />
                        <div>
                          <p className="text-sm text-gray-800 font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 text-center">
                    <button className="text-xs text-blue-600 font-semibold hover:underline">
                      Xem tất cả thông báo
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-blue-400 mx-1" />

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-blue-500 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <p className="text-white text-sm font-semibold">Nguyễn Văn B</p>
                <p className="text-blue-200 text-[11px]">Nhân viên kỹ thuật</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-blue-200 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20">
                  <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-b border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Nguyễn Văn B</p>
                        <p className="text-xs text-gray-500">nguyenvanb@email.com</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Thông tin cá nhân
                    </button>
                    <button
                      onClick={() => { navigate("/settings"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Cài đặt tài khoản
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { navigate("/login"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
