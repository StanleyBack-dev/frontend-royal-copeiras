import { createSupply } from "../../../api/supplies/methods/create";
import { getSupplies, getSupplyById } from "../../../api/supplies/methods/get";
import { updateSupply } from "../../../api/supplies/methods/update";
import type {
  ListQueryParams,
  PaginationMeta,
} from "../../../api/shared/contracts";
import {
  CreateSupplyPayloadSchema,
  SupplySchema,
  UpdateSupplyPayloadSchema,
  type CreateSupplyPayload,
  type Supply,
} from "../../../api/supplies/schema";
import { supplyUiCopy } from "../model/messages";

interface SaveSupplyParams {
  formData: CreateSupplyPayload;
  editing?: Supply | null;
}

export interface SuppliesCollectionResult {
  items: Supply[];
  pagination: PaginationMeta;
}

export async function fetchSupplies(
  params: ListQueryParams & { search?: string; isActive?: boolean } = {},
): Promise<SuppliesCollectionResult> {
  const response = await getSupplies(params);
  const parsed = SupplySchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(supplyUiCopy.errors.invalidCollectionData);
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

export async function fetchSupplyById(id: string): Promise<Supply | null> {
  const response = await getSupplyById(id);

  if (!response) {
    return null;
  }

  const parsed = SupplySchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(supplyUiCopy.errors.invalidSupplyResponse);
  }

  return parsed.data;
}

export async function saveSupply({
  formData,
  editing,
}: SaveSupplyParams): Promise<Supply> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateSupplyPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(supplyUiCopy.errors.invalidSupplyData);
        }

        return updateSupply(editing.idSupplies, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreateSupplyPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(supplyUiCopy.errors.invalidSupplyData);
        }

        return createSupply(parsedPayload.data);
      })();

  const parsedSupply = SupplySchema.safeParse(response);

  if (!parsedSupply.success) {
    throw new Error(supplyUiCopy.errors.invalidSupplyResponse);
  }

  return parsedSupply.data;
}
