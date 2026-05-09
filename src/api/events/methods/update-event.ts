import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { Event, UpdateEventPayload } from "../schema";

const API_BASE_URL = "/api/events";

export async function updateEvent(
  idEvents: string,
  payload: UpdateEventPayload,
) {
  const response = await httpClient.patch<unknown>(
    `${API_BASE_URL}/${idEvents}`,
    payload,
  );

  return extractMutationData<Event>(response.data);
}
