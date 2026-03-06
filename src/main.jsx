import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import AppRoutes from "./routes/AppRouter";
import "./index.css";

import ErrorBoundary from "./components/common/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <ErrorBoundary>
    <RouterProvider router={AppRoutes} />
  </ErrorBoundary>
  // </React.StrictMode>
);
