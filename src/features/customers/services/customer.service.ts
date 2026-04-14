import { createCustomer } from "../../../api/customers/methods/create";
import { getCustomers } from "../../../api/customers/methods/get";
import { updateCustomer } from "../../../api/customers/methods/update";
import {
  CreateCustomerPayloadSchema,
  CustomerSchema,
  UpdateCustomerPayloadSchema,
  type CreateCustomerPayload,
  type Customer,
} from "../../../api/customers/schema";
import { customerUiCopy } from "../model/messages";

interface SaveCustomerParams {
  userId: string;
  formData: CreateCustomerPayload;
  editing?: Customer | null;
}

export async function fetchCustomers(userId: string): Promise<Customer[]> {
  const response = await getCustomers(userId);
  const parsed = CustomerSchema.array().safeParse(response);

  if (!parsed.success) {
    throw new Error(customerUiCopy.errors.invalidCollectionData);
  }

  return parsed.data;
}

export async function saveCustomer({
  userId,
  formData,
  editing,
}: SaveCustomerParams): Promise<Customer> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateCustomerPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(customerUiCopy.errors.invalidCustomerData);
        }

        return updateCustomer(editing.idCustomers, parsedPayload.data, userId);
      })()
    : await (() => {
        const parsedPayload = CreateCustomerPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(customerUiCopy.errors.invalidCustomerData);
        }

        return createCustomer(parsedPayload.data, userId);
      })();

  const parsedCustomer = CustomerSchema.safeParse(response);

  if (!parsedCustomer.success) {
    throw new Error(customerUiCopy.errors.invalidCustomerResponse);
  }

  return parsedCustomer.data;
}
