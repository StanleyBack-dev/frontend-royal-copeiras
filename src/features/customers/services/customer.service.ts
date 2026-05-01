import { createCustomer } from "../../../api/customers/methods/create";
import { getCustomers } from "../../../api/customers/methods/get";
import { updateCustomer } from "../../../api/customers/methods/update";
import type {
  ListQueryParams,
  PaginationMeta,
} from "../../../api/shared/contracts";
import {
  CreateCustomerPayloadSchema,
  CustomerSchema,
  UpdateCustomerPayloadSchema,
  type CreateCustomerPayload,
  type Customer,
} from "../../../api/customers/schema";
import { customerUiCopy } from "../model/messages";

interface SaveCustomerParams {
  formData: CreateCustomerPayload;
  editing?: Customer | null;
}

export interface CustomersCollectionResult {
  items: Customer[];
  pagination: PaginationMeta;
}

export async function fetchCustomers(
  params: ListQueryParams = {},
): Promise<CustomersCollectionResult> {
  const response = await getCustomers(params);
  const parsed = CustomerSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(customerUiCopy.errors.invalidCollectionData);
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

export async function saveCustomer({
  formData,
  editing,
}: SaveCustomerParams): Promise<Customer> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateCustomerPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(customerUiCopy.errors.invalidCustomerData);
        }

        return updateCustomer(editing.idCustomers, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreateCustomerPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(customerUiCopy.errors.invalidCustomerData);
        }

        return createCustomer(parsedPayload.data);
      })();

  const parsedCustomer = CustomerSchema.safeParse(response);

  if (!parsedCustomer.success) {
    throw new Error(customerUiCopy.errors.invalidCustomerResponse);
  }

  return parsedCustomer.data;
}
