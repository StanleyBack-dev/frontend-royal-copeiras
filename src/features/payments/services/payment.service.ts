import {
  createPayment,
  getPaymentById,
  getPayments,
  updatePayment,
  type PaymentListQueryParams,
} from "@/api/payments/methods";
import type { PaginationMeta } from "@/api/shared/contracts";
import {
  CreatePaymentPayloadSchema,
  PaymentSchema,
  UpdatePaymentPayload,
  UpdatePaymentPayloadSchema,
  type CreatePaymentPayload,
  type Payment,
} from "@/api/payments/schema";
import { paymentUiCopy } from "../model/messages";

interface SavePaymentParams {
  formData: CreatePaymentPayload | UpdatePaymentPayload;
  editing?: Payment | null;
}

export type { PaymentListQueryParams };

export interface PaymentsCollectionResult {
  items: Payment[];
  pagination: PaginationMeta;
}

export async function fetchPayments(
  params: PaymentListQueryParams = {},
): Promise<PaymentsCollectionResult> {
  const response = await getPayments(params);
  const parsed = PaymentSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(paymentUiCopy.errors.invalidCollectionData);
  }

  return {
    items: parsed.data,
    pagination: {
      total: response.total,
      currentPage: response.currentPage,
      limit: response.limit,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
    },
  };
}

export async function fetchPaymentById(idPayments: string): Promise<Payment> {
  const response = await getPaymentById(idPayments);
  const parsed = PaymentSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(paymentUiCopy.errors.invalidPaymentData);
  }

  return parsed.data;
}

export async function savePayment({
  formData,
  editing,
}: SavePaymentParams): Promise<Payment> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdatePaymentPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(paymentUiCopy.errors.invalidPaymentData);
        }

        return updatePayment(editing.idPayments, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreatePaymentPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(paymentUiCopy.errors.invalidPaymentData);
        }

        return createPayment(parsedPayload.data);
      })();

  const parsedPayment = PaymentSchema.safeParse(response);

  if (!parsedPayment.success) {
    throw new Error(paymentUiCopy.errors.invalidPaymentResponse);
  }

  return parsedPayment.data;
}
