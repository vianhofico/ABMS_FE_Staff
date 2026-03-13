import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter"; // Import component vừa sửa
import "./index.css";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AuthProvider from "./context/AuthProvider";
import AppRoutes from "./routes/AppRouter";
import { RouterProvider } from "react-router-dom";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>


<AuthProvider>
  <RouterProvider router={AppRoutes} />
</AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);