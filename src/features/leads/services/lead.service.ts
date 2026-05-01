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
  formData: CreateLeadPayload;
  editing?: Lead | null;
}

export type { LeadListQueryParams };

export interface LeadsCollectionResult {
  items: Lead[];
  pagination: PaginationMeta;
}

export async function fetchLeads(
  params: LeadListQueryParams = {},
): Promise<LeadsCollectionResult> {
  const response = await getLeads(params);
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
  formData,
  editing,
}: SaveLeadParams): Promise<Lead> {
  const response = editing
    ? await (() => {
        const parsedPayload = UpdateLeadPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(leadUiCopy.errors.invalidLeadData);
        }

        return updateLead(editing.idLeads, parsedPayload.data);
      })()
    : await (() => {
        const parsedPayload = CreateLeadPayloadSchema.safeParse(formData);

        if (!parsedPayload.success) {
          throw new Error(leadUiCopy.errors.invalidLeadData);
        }

        return createLead(parsedPayload.data);
      })();

  const parsedLead = LeadSchema.safeParse(response);

  if (!parsedLead.success) {
    throw new Error(leadUiCopy.errors.invalidLeadResponse);
  }

  return parsedLead.data;
}
