import { createBrowserRouter, Navigate } from "react-router-dom";

import StaffLayout from "../layouts/StaffLayout";
import RouteErrorBoundary from "../components/common/RouteErrorBoundary";
import Dashboard from "../pages/Dashboard";
import MaintenanceList from "../pages/maintenance/MaintenanceList";
import MaintenanceDetail from "../pages/maintenance/MaintenanceDetail";
import ProtectedRoute from "../context/ProtectedRoute";
import Login from "../pages/auth/Login";
const AppRoutes = createBrowserRouter([
    {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",

    element: (
      <ProtectedRoute>
        <StaffLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      /* ===== MAINTENANCE ===== */
      {
        path: "maintenance",
        element: <MaintenanceList />,
      },
      {
        path: "maintenance/:id",
        element: <MaintenanceDetail />,
      },
      {
        path: "quotations",
        element: <Navigate to="/maintenance" replace />,
      },
    ],
  },
]);

export default AppRoutes;
