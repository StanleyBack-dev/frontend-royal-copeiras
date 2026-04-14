import { useEffect, useState } from "react";
import { z } from "zod";
import type {
  CreateCustomerPayload,
  Customer,
} from "../../../api/customers/schema";
import {
  customerFormSchema,
  emptyCustomerFormValues,
  type CustomerFormValues,
} from "../model/form";
import { normalizeCustomerFormValues } from "../model/formatters";
import {
  mapCustomerFormToPayload,
  mapCustomerFormToValidationInput,
  mapCustomerToFormValues,
} from "../model/mappers";

interface UseCustomerFormParams {
  mode: "create" | "edit";
  id?: string;
  customers: Customer[];
}

interface SubmitCustomerFormResult {
  success: boolean;
  payload?: CreateCustomerPayload;
  errors?: string[];
}

type CustomerFormErrors = Partial<
  Record<Extract<keyof CustomerFormValues, string>, string>
>;

export function useCustomerForm({
  mode,
  id,
  customers,
}: UseCustomerFormParams) {
  const [form, setForm] = useState<CustomerFormValues>(emptyCustomerFormValues);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [errors, setErrors] = useState<CustomerFormErrors>({});

  useEffect(() => {
    if (mode === "edit" && id && customers.length) {
      const found = customers.find((customer) => customer.idCustomers === id);
      if (found) {
        setEditing(found);
        setForm(mapCustomerToFormValues(found));
        setErrors({});
        return;
      }
    }

    setEditing(null);
    setForm(emptyCustomerFormValues);
    setErrors({});
  }, [customers, id, mode]);

  function updateForm(nextValues: CustomerFormValues) {
    setErrors({});
    setForm((previousValues) =>
      normalizeCustomerFormValues(nextValues, previousValues),
    );
  }

  function mapValidationErrors(values: CustomerFormValues) {
    const validationResult = validate(values);

    if (validationResult.success) {
      return {};
    }

    return validationResult.error.issues.reduce(
      (acc: CustomerFormErrors, issue: z.ZodIssue) => {
        const field = issue.path[0];

        if (typeof field === "string" && !(field in acc)) {
          acc[field as Extract<keyof CustomerFormValues, string>] =
            issue.message;
        }

        return acc;
      },
      {},
    );
  }

  function validate(values: CustomerFormValues) {
    return customerFormSchema.safeParse(
      mapCustomerFormToValidationInput(values),
    );
  }

  function submit(values: CustomerFormValues): SubmitCustomerFormResult {
    const result = validate(values);

    if (!result.success) {
      setErrors(mapValidationErrors(values));
      return {
        success: false,
        errors: result.error.issues.map((issue: z.ZodIssue) => issue.message),
      };
    }

    setErrors({});

    return {
      success: true,
      payload: mapCustomerFormToPayload(values),
    };
  }

  return {
    form,
    editing,
    errors,
    setForm: updateForm,
    submit,
  };
}
