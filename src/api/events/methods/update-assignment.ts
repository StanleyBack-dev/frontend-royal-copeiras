import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type { EventAssignment, UpdateEventAssignmentPayload } from "../schema";

const API_BASE_URL = "/api/events";

export async function updateEventAssignment(
  idEventAssignments: string,
  payload: UpdateEventAssignmentPayload,
) {
  const response = await httpClient.patch<unknown>(
    `${API_BASE_URL}/assignments/${idEventAssignments}`,
    payload,
  );

  return extractMutationData<EventAssignment>(response.data);
}
