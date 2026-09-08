import { useEffect, useMemo, useState } from "react";
import type { Budget } from "@/api/budgets/schema";
import {
  budgetFormSchema,
  createEmptyBudgetFormValues,
  emptyBudgetItemFormValues,
  type BudgetFormValues,
} from "@/features/budgets/model/form";
import { normalizeBudgetFormValues } from "@/features/budgets/model/formatters";
import {
  calculateBudgetTotals,
  mapBudgetFormToPayload,
  mapBudgetToDuplicateFormValues,
  mapBudgetToFormValues,
} from "@/features/budgets/model/mappers";
import { fetchBudgetById } from "@/features/budgets/services/budget.service";

interface UseBudgetFormParams {
  mode: "create" | "edit";
  id?: string;
  budgets: Budget[];
  initialLeadId?: string;
  duplicateFromId?: string;
}

type BudgetFormErrors = Partial<
  Record<Extract<keyof BudgetFormValues, string>, string>
>;

export function useBudgetForm({
  mode,
  id,
  budgets,
  initialLeadId,
  duplicateFromId,
}: UseBudgetFormParams) {
  const [form, setForm] = useState<BudgetFormValues>(
    createEmptyBudgetFormValues(initialLeadId),
  );
  const [editing, setEditing] = useState<Budget | null>(null);
  const [duplicateSource, setDuplicateSource] = useState<Budget | null>(null);
  const [errors, setErrors] = useState<BudgetFormErrors>({});
  const [loadingBudget, setLoadingBudget] = useState(false);

  // Create mode with ?duplicateFrom=<id>: clone an existing budget's data
  // into the new draft instead of starting from a blank form.
  useEffect(() => {
    if (mode !== "create" || !duplicateFromId) {
      setDuplicateSource(null);
      return;
    }

    let isMounted = true;
    const fromContext = budgets.find(
      (budget) => budget.idBudgets === duplicateFromId,
    );

    if (fromContext) {
      setDuplicateSource(fromContext);
      setForm(mapBudgetToDuplicateFormValues(fromContext));
      return;
    }

    setLoadingBudget(true);
    void fetchBudgetById(duplicateFromId)
      .then((budget) => {
        if (!isMounted) return;
        setDuplicateSource(budget);
        setForm(mapBudgetToDuplicateFormValues(budget));
      })
      .catch(() => {
        // Source budget couldn't be loaded; leave the form blank rather
        // than block the user from creating a budget from scratch.
      })
      .finally(() => {
        if (isMounted) setLoadingBudget(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode, duplicateFromId, budgets]);

  // Primary effect: load from context budgets
  useEffect(() => {
    if (mode === "edit" && id && budgets.length) {
      const found = budgets.find((budget) => budget.idBudgets === id);
      if (found) {
        setEditing(found);
        setForm(mapBudgetToFormValues(found));
        setErrors({});
        return;
      }
    }

    // If in edit mode but budget not found in context, will try direct fetch.
    // Skip the reset when duplicating — the dedicated effect above owns the
    // form in that case.
    if (!(mode === "edit" && id) && !duplicateFromId) {
      setEditing(null);
      setForm(createEmptyBudgetFormValues(initialLeadId));
      setErrors({});
    }
  }, [budgets, id, initialLeadId, mode, duplicateFromId]);

  // Secondary effect: load directly from API when in edit mode but not found in context
  useEffect(() => {
    if (mode !== "edit" || !id || editing) {
      return;
    }

    let isMounted = true;
    setLoadingBudget(true);

    void fetchBudgetById(id)
      .then((budget) => {
        if (!isMounted) return;
        setEditing(budget);
        setForm(mapBudgetToFormValues(budget));
        setErrors({});
      })
      .catch(() => {
        if (!isMounted) return;
        // If fetch fails, form remains in edit mode but empty
        // User will see the issue and can navigate back
        setEditing(null);
        setForm(createEmptyBudgetFormValues(initialLeadId));
        setErrors({});
      })
      .finally(() => {
        if (isMounted) setLoadingBudget(false);
      });

    return () => {
      isMounted = false;
    };
  }, [mode, id, editing, initialLeadId]);

  function updateForm(nextValues: BudgetFormValues) {
    setForm((currentValues: BudgetFormValues) =>
      normalizeBudgetFormValues(nextValues, currentValues),
    );
  }

  function addItem(dayIndex = 0) {
    setForm((current: BudgetFormValues) =>
      normalizeBudgetFormValues(
        {
          ...current,
          items: [
            ...current.items,
            {
              ...emptyBudgetItemFormValues,
              description: "",
              eventDateIndex: dayIndex,
            },
          ],
        },
        current,
      ),
    );
  }

  function removeItem(index: number) {
    setForm((current: BudgetFormValues) =>
      normalizeBudgetFormValues(
        {
          ...current,
          items:
            current.items.length <= 1
              ? current.items
              : current.items.filter(
                  (
                    _item: BudgetFormValues["items"][number],
                    itemIndex: number,
                  ) => itemIndex !== index,
                ),
        },
        current,
      ),
    );
  }

  function updateItem(
    index: number,
    patch: Partial<(typeof form.items)[number]>,
  ) {
    setForm((current: BudgetFormValues) =>
      normalizeBudgetFormValues(
        {
          ...current,
          items: current.items.map(
            (item: BudgetFormValues["items"][number], itemIndex: number) =>
              itemIndex === index ? { ...item, ...patch } : item,
          ),
        },
        current,
      ),
    );
  }

  const totals = useMemo(
    () =>
      calculateBudgetTotals(
        form.items,
        form.displacementFee,
        form.discountPercentage,
        form.discountType,
        form.discountAmount,
      ),
    [
      form.items,
      form.displacementFee,
      form.discountPercentage,
      form.discountType,
      form.discountAmount,
    ],
  );

  function submit(values: BudgetFormValues) {
    const normalized = normalizeBudgetFormValues(values);
    const parsedForm = budgetFormSchema.safeParse(normalized);

    if (!parsedForm.success) {
      const fieldErrors = parsedForm.error.flatten().fieldErrors as Record<
        string,
        string[] | undefined
      >;
      setErrors(
        Object.fromEntries(
          Object.entries(fieldErrors).map(([fieldName, messages]) => [
            fieldName,
            messages?.[0],
          ]),
        ) as BudgetFormErrors,
      );
      return {
        success: false,
        errors: parsedForm.error.issues.map(
          (issue: { message: string }) => issue.message,
        ),
      };
    }

    const payload = mapBudgetFormToPayload(normalized);

    setErrors({});
    return {
      success: true,
      payload,
    };
  }

  return {
    form,
    editing,
    duplicateSource,
    errors,
    setForm: updateForm,
    addItem,
    removeItem,
    updateItem,
    totals,
    submit,
    loadingBudget,
  };
}
