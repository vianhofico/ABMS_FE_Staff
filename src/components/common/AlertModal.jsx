import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, title, message, type = 'info' }) {
    if (!isOpen) return null;

    const getConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                    color: 'bg-green-50',
                    titleColor: 'text-green-800',
                    btnColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                };
            case 'error':
                return {
                    icon: <AlertCircle className="w-12 h-12 text-red-500" />,
                    color: 'bg-red-50',
                    titleColor: 'text-red-800',
                    btnColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                };
            case 'warning':
                return {
                    icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
                    color: 'bg-yellow-50',
                    titleColor: 'text-yellow-800',
                    btnColor: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                };
            default:
                return {
                    icon: <Info className="w-12 h-12 text-blue-500" />,
                    color: 'bg-blue-50',
                    titleColor: 'text-blue-800',
                    btnColor: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                };
        }
    };

    const config = getConfig();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`p-6 flex flex-col items-center text-center ${config.color}`}>
                    <div className="mb-4 bg-white rounded-full p-2 shadow-sm">
                        {config.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${config.titleColor}`}>
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {message}
                    </p>
                </div>
                <div className="p-4 bg-white flex justify-center border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className={`px-8 py-2.5 rounded-xl text-white font-medium transition-colors focus:ring-2 focus:ring-offset-2 w-full ${config.btnColor}`}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
