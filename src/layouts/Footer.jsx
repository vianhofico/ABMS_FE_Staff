import { Building2 } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">

        {/* Left - Brand */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-700">Building Management</span>
        </div>

        {/* Center - Copyright */}
        <p className="text-xs text-gray-400 text-center">
          © {currentYear} Building Management System. All rights reserved.
        </p>

        {/* Right - Links */}
        <div className="flex items-center gap-4">
          <a href="/privacy" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
            Chính sách bảo mật
          </a>
          <span className="text-gray-300 text-xs">|</span>
          <a href="/terms" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
            Điều khoản sử dụng
          </a>
          <span className="text-gray-300 text-xs">|</span>
          <a href="/support" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
            Hỗ trợ
          </a>
        </div>
      </div>
    </footer>
  );
}
