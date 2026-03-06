import { NavLink, useLocation } from "react-router-dom";
import { X } from "lucide-react";

export default function Sidebar({ navItems, onClose }) {
  const location = useLocation();

  return (
    <aside className="w-60 min-h-full bg-white flex flex-col">
      {/* Header của Sidebar - Chỉ hiển thị nút đóng ở bản Mobile */}
      <div className="p-4 flex justify-between items-center md:hidden border-b border-gray-100 mb-2">
        <span className="font-bold text-gray-800">Menu</span>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
            >
              <Icon size={18} />
              <span className="flex-1 whitespace-nowrap">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
