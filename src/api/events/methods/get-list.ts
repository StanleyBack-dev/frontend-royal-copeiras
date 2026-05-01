import { httpClient } from "../../shared/httpClient";
import { normalizeListResponse } from "../../shared/normalizers";
import type { Event } from "../schema";

const API_BASE_URL = "/api/events";

export interface EventListQueryParams {
  page?: number;
  limit?: number;
  idContracts?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getEvents(params: EventListQueryParams = {}) {
  const response = await httpClient.get<unknown>(API_BASE_URL, { params });

  return normalizeListResponse<Event>(response.data);
}
