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
  buildBudgetServiceDescription,
  budgetServiceTypeOptions,
} from "@/features/budgets/model/service-items";
import {
  calculateBudgetTotals,
  mapBudgetFormToPayload,
  mapBudgetToFormValues,
} from "@/features/budgets/model/mappers";

interface UseBudgetFormParams {
  mode: "create" | "edit";
  id?: string;
  budgets: Budget[];
  initialLeadId?: string;
}

type BudgetFormErrors = Partial<
  Record<Extract<keyof BudgetFormValues, string>, string>
>;

export function useBudgetForm({
  mode,
  id,
  budgets,
  initialLeadId,
}: UseBudgetFormParams) {
  const [form, setForm] = useState<BudgetFormValues>(
    createEmptyBudgetFormValues(initialLeadId),
  );
  const [editing, setEditing] = useState<Budget | null>(null);
  const [errors, setErrors] = useState<BudgetFormErrors>({});

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

    setEditing(null);
    setForm(createEmptyBudgetFormValues(initialLeadId));
    setErrors({});
  }, [budgets, id, initialLeadId, mode]);

  function updateForm(nextValues: BudgetFormValues) {
    setForm((currentValues: BudgetFormValues) =>
      normalizeBudgetFormValues(nextValues, currentValues),
    );
  }

  function addItem() {
    setForm((current: BudgetFormValues) =>
      normalizeBudgetFormValues(
        {
          ...current,
          items: [
            ...current.items,
            (() => {
              const usedTypes = new Set(
                current.items.map((item) => item.serviceType).filter(Boolean),
              );
              const nextType =
                budgetServiceTypeOptions.find((type) => !usedTypes.has(type)) ||
                "";

              return {
                ...emptyBudgetItemFormValues,
                serviceType: nextType,
                description: nextType
                  ? buildBudgetServiceDescription(nextType, 1)
                  : "",
              };
            })(),
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
    () => calculateBudgetTotals(form.items, form.displacementFee),
    [form.items, form.displacementFee],
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
    errors,
    setForm: updateForm,
    addItem,
    removeItem,
    updateItem,
    totals,
    submit,
  };
}
