import type { ListQueryParams } from "../../shared/contracts";
import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Payment } from "../schema";

const API_BASE_URL = "/api/payments";

export interface PaymentListQueryParams extends ListQueryParams {
  idPayments?: string;
  idLeads?: string;
  idBudgets?: string;
  idContracts?: string;
  idEvents?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getPayments(params: PaymentListQueryParams = {}) {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Payment>(response.data);
}

export async function getPaymentById(idPayments: string) {
  const response = await httpClient.get<unknown>(API_BASE_URL, {
    params: { idPayments, page: 1, limit: 1 },
  });
  const normalized = normalizeListResponse<Payment>(response.data);

  return normalized.items[0] ?? null;
}
