import {
  createContract,
  getContracts,
  updateContract,
  type ContractListQueryParams,
} from "../../../api/contracts/methods";
import { getBudgets } from "../../../api/budgets/methods";
import { BudgetSchema, type Budget } from "../../../api/budgets/schema";
import type { PaginationMeta } from "../../../api/shared/contracts";
import {
  ContractSchema,
  CreateContractPayloadSchema,
  UpdateContractPayloadSchema,
  type Contract,
  type CreateContractPayload,
} from "../../../api/contracts/schema";
import { contractUiCopy } from "../model/messages";

interface SaveContractParams {
  userId: string;
  formData: CreateContractPayload;
  editing?: Contract | null;
}

export type { ContractListQueryParams };

export interface ContractsCollectionResult {
  items: Contract[];
  pagination: PaginationMeta;
}

export async function fetchContracts(
  userId: string,
  params: ContractListQueryParams = {},
): Promise<ContractsCollectionResult> {
  const response = await getContracts(params);
  const parsed = ContractSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(contractUiCopy.errors.invalidContractData);
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

export async function fetchApprovedBudgets(userId: string): Promise<Budget[]> {
  const response = await getBudgets({
    page: 1,
    limit: 100,
    status: "approved",
  });
  const parsed = BudgetSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(contractUiCopy.errors.loadBudgetsFallback);
  }

  return parsed.data;
}

export async function saveContract({
  userId,
  formData,
  editing,
}: SaveContractParams): Promise<Contract> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateContractPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(contractUiCopy.errors.invalidContractData);
        }

        return updateContract(editing.idContracts, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreateContractPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(contractUiCopy.errors.invalidContractData);
        }

        return createContract(parsedPayload.data);
      })();

  const parsedResponse = ContractSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(contractUiCopy.errors.invalidContractData);
  }

  return parsedResponse.data;
}
