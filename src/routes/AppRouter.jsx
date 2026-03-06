import { createBrowserRouter, Navigate } from "react-router-dom";

import StaffLayout from "../layouts/StaffLayout";
import RouteErrorBoundary from "../components/common/RouteErrorBoundary";
import Dashboard from "../pages/Dashboard";
import MaintenanceList from "../pages/maintenance/MaintenanceList";
import MaintenanceDetail from "../pages/maintenance/MaintenanceDetail";

const AppRoutes = createBrowserRouter([
  {
    path: "/",
    element: <StaffLayout />,
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
    ],
  },
]);

export default AppRoutes;

