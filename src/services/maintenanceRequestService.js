import apiClient from "./apiClient";

// Staff: view requests assigned to them / all requests
export const fetchMaintenanceRequests = (params = {}) =>
  apiClient.get("/maintenance-requests", params);

export const fetchMaintenanceRequestDetail = (id) =>
  apiClient.get(`/maintenance-requests/${id}`);

export const cancelMaintenanceRequest = (id, reason) =>
  apiClient.patch(`/maintenance-requests/${id}/cancel`, { reason });
