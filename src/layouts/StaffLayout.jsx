import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../layouts/Sidebar";
import { staffNav } from "../layouts/Navigation";
import Header from "./Header";
import Footer from "./Footer";
import { Menu } from "lucide-react";
import { ChevronLeft } from "lucide-react";

export default function StaffLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Nút Mở Sidebar (Chỉ hiện khi Sidebar đang đóng) */}
      {!isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md hover:bg-gray-50 text-blue-600 transition-all"
          title="Mở menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarOpen ? "w-60 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0"}
        `}
      >
        {/* Nút đóng Sidebar */}
        <button
          onClick={toggleSidebar}
          className="absolute right-2 top-3 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md z-50"
        >
          <ChevronLeft size={18} />
        </button>

        <Sidebar navItems={staffNav} onClose={toggleSidebar} />
      </aside>

      {/* Main Content */}
      <div
        className={`pt-16 min-h-screen flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "pl-60" : "pl-0"}
        `}
      >
        <main className="flex-1 p-6 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>

        <Footer />
      </div>

      {/* Overlay cho Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
