import apiClient from "./apiClient";

// ── Quotations ──────────────────────────────────────
export const fetchMaintenanceQuotations = (requestId) =>
  apiClient.get(`/maintenance-workflows/${requestId}/quotations`);

export const createQuotation = (requestId, data) =>
  apiClient.post(`/maintenance-workflows/${requestId}/quotations`, data);

export const updateQuotation = (quotationId, data) =>
  apiClient.put(`/maintenance-quotations/${quotationId}`, data);

export const fetchQuotationDetail = (quotationId) =>
  apiClient.get(`/maintenance-quotations/${quotationId}`);

// status: SENT | APPROVED | REJECTED
export const updateQuotationStatus = (quotationId, status) =>
  apiClient.patch(`/maintenance-quotations/${quotationId}/status?status=${status}`);

// ── Schedules ───────────────────────────────────────
export const fetchSchedules = (requestId) =>
  apiClient.get(`/maintenance-workflows/${requestId}/schedules`);

export const proposeSchedule = (requestId, data) =>
  apiClient.post(`/maintenance-workflows/${requestId}/schedules`, data);

// action: ACCEPT | REJECT | COUNTER_PROPOSE
export const respondToSchedule = (requestId, scheduleId, body) =>
  apiClient.patch(`/maintenance-workflows/${requestId}/schedules/${scheduleId}/respond`, body);

// ── Progress ────────────────────────────────────────
export const fetchMaintenanceProgress = (requestId) =>
  apiClient.get(`/maintenance-workflows/${requestId}/progress`);

export const addProgress = (requestId, data) =>
  apiClient.post(`/maintenance-workflows/${requestId}/progress`, data);

// ── Resources ───────────────────────────────────────
export const fetchResources = (requestId) =>
  apiClient.get(`/maintenance-workflows/${requestId}/resources`);

export const addResource = (requestId, data) =>
  apiClient.post(`/maintenance-workflows/${requestId}/resources`, data);

// ── Logs ────────────────────────────────────────────
export const fetchMaintenanceLogs = (requestId) =>
  apiClient.get(`/maintenance-workflows/${requestId}/logs`);
