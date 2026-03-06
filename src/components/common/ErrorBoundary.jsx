import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Oops! Đã xảy ra lỗi
                        </h1>

                        <p className="text-gray-500 mb-8 leading-relaxed">
                            Xin lỗi, đã có lỗi hệ thống bất ngờ xảy ra trong quá trình hiển thị giao diện. Vui lòng tải lại trang.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-8 text-left bg-gray-100 p-4 rounded-xl overflow-x-auto text-sm text-red-600 font-mono">
                                <p className="font-bold mb-2">{this.state.error.toString()}</p>
                                <span className="text-xs">{this.state.errorInfo?.componentStack}</span>
                            </div>
                        )}

                        <button
                            onClick={this.handleReload}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                        >
                            <RefreshCcw size={20} />
                            Tải lại trang
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
