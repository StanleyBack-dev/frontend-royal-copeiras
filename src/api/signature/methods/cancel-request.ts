import { httpClient } from "../../shared/httpClient";

interface CancelSignatureRequestResult {
  success: boolean;
  message: string;
  code: string;
}

export async function cancelSignatureRequest(
  requestId: string,
  userId: string,
): Promise<CancelSignatureRequestResult> {
  const response = await httpClient.post<CancelSignatureRequestResult>(
    `/api/signature/${requestId}/cancel`,
    {},
    {
      headers: {
        "x-user-id": userId,
      },
    },
  );

  return response.data;
}
