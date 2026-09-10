import { useEffect, useState } from "react";
import { z } from "zod";
import type { CreateSupplyPayload, Supply } from "../../../api/supplies/schema";
import {
  emptySupplyFormValues,
  supplyFormSchema,
  type SupplyFormValues,
} from "../model/form";
import {
  mapSupplyFormToPayload,
  mapSupplyFormToValidationInput,
  mapSupplyToFormValues,
} from "../model/mappers";
import { fetchSupplyById } from "../services/supply.service";

interface UseSupplyFormParams {
  mode: "create" | "edit";
  id?: string;
  supplies: Supply[];
}

interface SubmitSupplyFormResult {
  success: boolean;
  payload?: CreateSupplyPayload;
  errors?: string[];
}

type SupplyFormErrors = Partial<
  Record<Extract<keyof SupplyFormValues, string>, string>
>;

export function useSupplyForm({ mode, id, supplies }: UseSupplyFormParams) {
  const [form, setForm] = useState<SupplyFormValues>(emptySupplyFormValues);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [errors, setErrors] = useState<SupplyFormErrors>({});
  const [loadingSupply, setLoadingSupply] = useState(false);

  useEffect(() => {
    if (mode === "edit") {
      if (!id) {
        return;
      }

      const found = supplies.find((supply) => supply.idSupplies === id);
      if (found) {
        setEditing(found);
        setForm(mapSupplyToFormValues(found));
        setErrors({});
      }
      // Not in the current list page: leave the by-id effect below to load it.
      // Never blank the form out in edit mode — that is the pagination bug.
      return;
    }

    setEditing(null);
    setForm(emptySupplyFormValues);
    setErrors({});
  }, [supplies, id, mode]);

  // Fallback for a deep link / refresh straight onto the edit form, where the
  // record sits outside the loaded list page.
  useEffect(() => {
    if (mode !== "edit" || !id || editing?.idSupplies === id) {
      return;
    }

    if (supplies.some((supply) => supply.idSupplies === id)) {
      return;
    }

    let active = true;
    setLoadingSupply(true);

    void fetchSupplyById(id)
      .then((supply) => {
        if (!active || !supply) {
          return;
        }

        setEditing(supply);
        setForm(mapSupplyToFormValues(supply));
        setErrors({});
      })
      .catch(() => {
        // Leave the form as-is; the user can navigate back.
      })
      .finally(() => {
        if (active) {
          setLoadingSupply(false);
        }
      });

    return () => {
      active = false;
    };
  }, [supplies, editing, id, mode]);

  function updateForm(nextValues: SupplyFormValues) {
    setErrors({});
    setForm(nextValues);
  }

  function mapValidationErrors(values: SupplyFormValues) {
    const validationResult = validate(values);

    if (validationResult.success) {
      return {};
    }

    return validationResult.error.issues.reduce(
      (acc: SupplyFormErrors, issue: z.ZodIssue) => {
        const field = issue.path[0];

        if (typeof field === "string" && !(field in acc)) {
          acc[field as Extract<keyof SupplyFormValues, string>] = issue.message;
        }

        return acc;
      },
      {},
    );
  }

  function validate(values: SupplyFormValues) {
    return supplyFormSchema.safeParse(mapSupplyFormToValidationInput(values));
  }

  function submit(values: SupplyFormValues): SubmitSupplyFormResult {
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
      payload: mapSupplyFormToPayload(values),
    };
  }

  return {
    form,
    editing,
    errors,
    loadingSupply,
    setForm: updateForm,
    submit,
  };
}
