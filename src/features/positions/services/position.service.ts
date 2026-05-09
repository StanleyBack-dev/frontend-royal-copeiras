import { createPosition } from "../../../api/positions/methods/create";
import { getPositions } from "../../../api/positions/methods/get";
import { updatePosition } from "../../../api/positions/methods/update";
import type {
  ListQueryParams,
  PaginationMeta,
} from "../../../api/shared/contracts";
import {
  CreatePositionPayloadSchema,
  PositionSchema,
  UpdatePositionPayloadSchema,
  type CreatePositionPayload,
  type Position,
} from "../../../api/positions/schema";
import { positionUiCopy } from "../model/messages";

interface SavePositionParams {
  formData: CreatePositionPayload;
  editing?: Position | null;
}

export interface PositionsCollectionResult {
  items: Position[];
  pagination: PaginationMeta;
}

export async function fetchPositions(
  params: ListQueryParams & { search?: string; isActive?: boolean } = {},
): Promise<PositionsCollectionResult> {
  const response = await getPositions(params);
  const parsed = PositionSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(positionUiCopy.errors.invalidCollectionData);
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

export async function savePosition({
  formData,
  editing,
}: SavePositionParams): Promise<Position> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdatePositionPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(positionUiCopy.errors.invalidPositionData);
        }

        return updatePosition(editing.idPositions, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreatePositionPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(positionUiCopy.errors.invalidPositionData);
        }

        return createPosition(parsedPayload.data);
      })();

  const parsedPosition = PositionSchema.safeParse(response);

  if (!parsedPosition.success) {
    throw new Error(positionUiCopy.errors.invalidPositionResponse);
  }

  return parsedPosition.data;
}
