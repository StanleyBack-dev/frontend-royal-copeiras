import { createLead } from "../../../api/leads/methods/create";
import {
  getLeads,
  type LeadListQueryParams,
} from "../../../api/leads/methods/get";
import { updateLead } from "../../../api/leads/methods/update";
import type { PaginationMeta } from "../../../api/shared/contracts";
import {
  CreateLeadPayloadSchema,
  LeadSchema,
  UpdateLeadPayloadSchema,
  type CreateLeadPayload,
  type Lead,
} from "../../../api/leads/schema";
import { leadUiCopy } from "../model/messages";

interface SaveLeadParams {
  userId: string;
  formData: CreateLeadPayload;
  editing?: Lead | null;
}

export type { LeadListQueryParams };

export interface LeadsCollectionResult {
  items: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(
  userId: string,
  params: LeadListQueryParams = {},
): Promise<LeadsCollectionResult> {
  const response = await getLeads(userId, params);
  const parsed = LeadSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(leadUiCopy.errors.invalidCollectionData);
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

export async function saveLead({
  userId,
  formData,
  editing,
}: SaveLeadParams): Promise<Lead> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateLeadPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(leadUiCopy.errors.invalidLeadData);
        }

        return updateLead(editing.idLeads, parsedPayload.data, userId);
      })()
    : await (() => {
        const parsedPayload = CreateLeadPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(leadUiCopy.errors.invalidLeadData);
        }

        return createLead(parsedPayload.data, userId);
      })();

  const parsedLead = LeadSchema.safeParse(response);

  if (!parsedLead.success) {
    throw new Error(leadUiCopy.errors.invalidLeadResponse);
  }

  return parsedLead.data;
}
