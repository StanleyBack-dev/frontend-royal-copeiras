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
import { fetchCustomerById } from "../services/customer.service";

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
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      if (!id) {
        return;
      }

      const found = customers.find((customer) => customer.idCustomers === id);
      if (found) {
        setEditing(found);
        setForm(mapCustomerToFormValues(found));
        setErrors({});
      }
      // Not in the current list page: leave the by-id effect below to load it.
      // Never blank the form out in edit mode — that is the pagination bug.
      return;
    }

    setEditing(null);
    setForm(emptyCustomerFormValues);
    setErrors({});
  }, [customers, id, mode]);

  // Fallback for a deep link / refresh straight onto the edit form, where the
  // record sits outside the loaded list page.
  useEffect(() => {
    if (mode !== "edit" || !id || editing?.idCustomers === id) {
      return;
    }

    if (customers.some((customer) => customer.idCustomers === id)) {
      return;
    }

    let active = true;
    setLoadingCustomer(true);

    void fetchCustomerById(id)
      .then((customer) => {
        if (!active || !customer) {
          return;
        }

        setEditing(customer);
        setForm(mapCustomerToFormValues(customer));
        setErrors({});
      })
      .catch(() => {
        // Leave the form as-is; the user can navigate back.
      })
      .finally(() => {
        if (active) {
          setLoadingCustomer(false);
        }
      });

    return () => {
      active = false;
    };
  }, [customers, editing, id, mode]);

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
    loadingCustomer,
    setForm: updateForm,
    submit,
  };
}
