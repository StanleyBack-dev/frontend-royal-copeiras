import { createBudget } from "../../../api/budgets/methods/create";
import {
  getBudgets,
  type BudgetListQueryParams,
} from "../../../api/budgets/methods/get";
import { updateBudget } from "../../../api/budgets/methods/update";
import { fetchLeads } from "../../leads/services/lead.service";
import type { PaginationMeta } from "../../../api/shared/contracts";
import {
  BudgetSchema,
  CreateBudgetPayloadSchema,
  UpdateBudgetPayloadSchema,
  type Budget,
  type CreateBudgetPayload,
} from "../../../api/budgets/schema";
import type { Lead } from "../../../api/leads/schema";
import { budgetUiCopy } from "../model/messages";

interface SaveBudgetParams {
  userId: string;
  formData: CreateBudgetPayload;
  editing?: Budget | null;
}

export type { BudgetListQueryParams };

export interface BudgetsCollectionResult {
  items: Budget[];
  pagination: PaginationMeta;
}

export async function fetchBudgets(
  userId: string,
  params: BudgetListQueryParams = {},
): Promise<BudgetsCollectionResult> {
  const response = await getBudgets(params);
  const parsed = BudgetSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(budgetUiCopy.errors.invalidCollectionData);
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

export async function fetchBudgetLeadOptions(userId: string): Promise<Lead[]> {
  const response = await fetchLeads(userId, { page: 1, limit: 100 });
  return response.items;
}

export async function saveBudget({
  userId,
  formData,
  editing,
}: SaveBudgetParams): Promise<Budget> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateBudgetPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(budgetUiCopy.errors.invalidBudgetData);
        }

        return updateBudget(editing.idBudgets, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreateBudgetPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(budgetUiCopy.errors.invalidBudgetData);
        }

        return createBudget(parsedPayload.data);
      })();

  const parsedBudget = BudgetSchema.safeParse(response);

  if (!parsedBudget.success) {
    throw new Error(budgetUiCopy.errors.invalidBudgetResponse);
  }

  return parsedBudget.data;
}
