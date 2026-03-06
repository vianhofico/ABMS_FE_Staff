import apiClient from "./apiClient";

const maintenanceQuotationService = {
  getQuotationById: (quotationId) =>
    apiClient.get(`/maintenance-requests/quotations/${quotationId}`),

  updateQuotation: (quotationId, data) =>
    apiClient.put(`/maintenance-requests/quotations/${quotationId}`, data),

  updateQuotationStatus: (quotationId, status) =>
    apiClient.patch(`/maintenance-requests/quotations/${quotationId}/status?status=${status}`),
};

export default maintenanceQuotationService;
