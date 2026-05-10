import type { Payment, UpdatePaymentPayload } from "../schema";
import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";

const API_BASE_URL = "/api/payments";

export async function updatePayment(
  id: string,
  payload: UpdatePaymentPayload,
): Promise<Payment> {
  const response = await httpClient.patch<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
  );

  return extractMutationData<Payment>(response.data);
}
