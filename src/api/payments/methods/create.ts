import type { CreatePaymentPayload, Payment } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/payments";

export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload);

  return extractMutationData<Payment>(response.data);
}
