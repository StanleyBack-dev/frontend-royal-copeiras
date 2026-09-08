import { httpClient } from "../../shared/httpClient";
import { extractMutationData } from "../../shared/normalizers";
import type {
  SubmitPublicIntakePayload,
  SubmittedPublicIntake,
} from "../schema";

export async function submitPublicIntake(
  payload: SubmitPublicIntakePayload,
): Promise<SubmittedPublicIntake> {
  const response = await httpClient.post<unknown>(
    "/api/public-intake/submit",
    payload,
  );

  return extractMutationData<SubmittedPublicIntake>(response.data);
}
