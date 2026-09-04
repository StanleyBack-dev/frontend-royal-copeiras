import { executeGraphql } from "../../../../shared/http/graphql-client.js";

export class SendContractSignatureRequestService {
  async execute(userId, idContracts, context = {}) {
    const mutation = `
      mutation SendContractSignatureRequest($input: SendContractSignatureRequestInputDto!) {
        sendContractSignatureRequest(input: $input) {
          success
          message
          code
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: { input: { idContracts } },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
      // Creating the envelope with the external signature provider can take
      // longer than the default GraphQL timeout. Retrying on timeout is not
      // safe here even with the backend's idempotency guard against
      // duplicate envelopes — a single generous attempt is preferable to a
      // request that quietly fires the mutation multiple times.
      timeoutMs: 30000,
      maxRetries: 0,
    });

    return data.sendContractSignatureRequest;
  }
}
