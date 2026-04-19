import { useEffect, useState } from "react";
import { z } from "zod";
import type { CreateLeadPayload, Lead } from "../../../api/leads/schema";
import {
  emptyLeadFormValues,
  leadFormSchema,
  type LeadFormValues,
} from "../model/form";
import { normalizeLeadFormValues } from "../model/formatters";
import {
  mapLeadFormToPayload,
  mapLeadFormToValidationInput,
  mapLeadToFormValues,
} from "../model/mappers";

interface UseLeadFormParams {
  mode: "create" | "edit";
  id?: string;
  leads: Lead[];
}

interface SubmitLeadFormResult {
  success: boolean;
  payload?: CreateLeadPayload;
  errors?: string[];
}

type LeadFormErrors = Partial<
  Record<Extract<keyof LeadFormValues, string>, string>
>;

export function useLeadForm({ mode, id, leads }: UseLeadFormParams) {
  const [form, setForm] = useState<LeadFormValues>(emptyLeadFormValues);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [errors, setErrors] = useState<LeadFormErrors>({});

  useEffect(() => {
    if (mode === "edit" && id && leads.length) {
      const found = leads.find((lead) => lead.idLeads === id);
      if (found) {
        setEditing(found);
        setForm(mapLeadToFormValues(found));
        setErrors({});
        return;
      }
    }

    setEditing(null);
    setForm(emptyLeadFormValues);
    setErrors({});
  }, [id, leads, mode]);

  function updateForm(nextValues: LeadFormValues) {
    setForm((previousValues) =>
      normalizeLeadFormValues(nextValues, previousValues),
    );
  }

  function submit(values: LeadFormValues): SubmitLeadFormResult {
    const normalized = normalizeLeadFormValues(values);
    const parsed = leadFormSchema.safeParse(
      mapLeadFormToValidationInput(normalized),
    );

    if (!parsed.success) {
      const nextErrors = parsed.error.flatten().fieldErrors;
      setErrors(nextErrors as LeadFormErrors);
      return {
        success: false,
        errors: parsed.error.issues.map((issue) => issue.message),
      };
    }

    setErrors({});

    return {
      success: true,
      payload: mapLeadFormToPayload(normalized),
    };
  }

  return {
    form,
    editing,
    errors,
    setForm: updateForm,
    submit,
    isEditingMissing: mode === "edit" && id && !editing && leads.length > 0,
    validationSchema: leadFormSchema satisfies z.ZodTypeAny,
  };
}
