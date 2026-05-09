import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { Position, UpdatePositionPayload } from "../schema";

const API_BASE_URL = "/api/positions";

export async function updatePosition(
  id: string,
  payload: UpdatePositionPayload,
): Promise<Position> {
  const response = await httpClient.put<unknown>(
    `${API_BASE_URL}/${id}`,
    payload,
  );

  return extractMutationData<Position>(response.data);
}
