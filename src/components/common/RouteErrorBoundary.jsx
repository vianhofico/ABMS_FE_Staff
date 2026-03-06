import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

export default function RouteErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    console.error("RouteErrorBoundary caught an error:", error);

    let title = "Oops! Đã xảy ra lỗi";
    let message = "Xin lỗi, đã có lỗi hệ thống bất ngờ xảy ra.";

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            title = "404 - Không tìm thấy trang";
            message = "Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.";
        } else if (error.status === 401) {
            title = "401 - Chưa xác thực";
            message = "Bạn không có quyền truy cập trang này.";
        } else if (error.status === 503) {
            title = "503 - Dịch vụ gián đoạn";
            message = "Hệ thống đang bảo trì, vui lòng quay lại sau.";
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {title}
                </h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    {message}
                </p>

                {process.env.NODE_ENV === 'development' && !isRouteErrorResponse(error) && error && (
                    <div className="mb-8 text-left bg-gray-100 p-4 rounded-xl overflow-x-auto text-sm text-red-600 font-mono">
                        <p className="font-bold mb-2">{error.message || error.toString()}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {isRouteErrorResponse(error) && error.status === 404 ? (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                        >
                            <Home size={20} />
                            Về trang chủ
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                        >
                            <RefreshCcw size={20} />
                            Tải lại trang
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
