import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { CreatePositionPayload, Position } from "../schema";

const API_BASE_URL = "/api/positions";

export async function createPosition(
  payload: CreatePositionPayload,
): Promise<Position> {
  const response = await httpClient.post<unknown>(API_BASE_URL, payload);

  return extractMutationData<Position>(response.data);
}
