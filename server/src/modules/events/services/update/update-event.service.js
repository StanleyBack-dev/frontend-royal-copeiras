import { executeGraphql } from "../../../../shared/http/graphql-client.js";
import { invalidateCacheByPrefix } from "../../../../shared/cache/in-memory-cache.js";

export class UpdateEventService {
  async execute(userId, idEvents, input, context = {}) {
    const mutation = `
      mutation UpdateEvents($input: UpdateEventsInputDto!) {
        updateEvents(input: $input) {
          success
          message
          code
          data {
            idEvents
            status
            overtimeMinutes
            updatedAt
          }
        }
      }
    `;

    const data = await executeGraphql({
      query: mutation,
      variables: {
        input: {
          idEvents,
          ...input,
        },
      },
      userId,
      authorization: context.authorization,
      cookieHeader: context.cookieHeader,
      requestId: context.requestId,
    });

    invalidateCacheByPrefix(`events:list:${userId}:`);

    return data.updateEvents;
  }
}
