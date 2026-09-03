import { useCallback, useEffect, useState } from "react";
import type { CompanyProfile } from "@/api/company-profile/schema";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import { useToast } from "@/shared/toast/useToast";
import {
  fetchCompanyProfile,
  saveCompanyProfile,
} from "../services/company-profile.service";
import {
  EMPTY_COMPANY_PROFILE_FORM_VALUES,
  mapFormValuesToUpdatePayload,
  mapProfileToFormValues,
  type CompanyProfileFormValues,
} from "../model/fields";

const LOAD_ERROR = "Não foi possível carregar o perfil da empresa";
const SAVE_ERROR = "Não foi possível salvar o perfil da empresa";
const SAVE_SUCCESS = "Perfil da empresa atualizado";

export interface UseCompanyProfileResult {
  profile: CompanyProfile | null;
  form: CompanyProfileFormValues;
  loading: boolean;
  saving: boolean;
  error: string | null;
  setField: (key: keyof CompanyProfileFormValues, value: string) => void;
  reset: () => void;
  reload: () => Promise<void>;
  save: () => Promise<boolean>;
}

export function useCompanyProfile(): UseCompanyProfileResult {
  const { showError, showSuccess } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState<CompanyProfileFormValues>(
    EMPTY_COMPANY_PROFILE_FORM_VALUES,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCompanyProfile();
      setProfile(data);
      setForm(mapProfileToFormValues(data));
    } catch (err) {
      const message = getHttpErrorMessage(err, LOAD_ERROR);
      setError(message);
      showError(LOAD_ERROR, message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = useCallback(
    (key: keyof CompanyProfileFormValues, value: string) => {
      setForm((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => {
    setForm(
      profile
        ? mapProfileToFormValues(profile)
        : EMPTY_COMPANY_PROFILE_FORM_VALUES,
    );
  }, [profile]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = mapFormValuesToUpdatePayload(form);
      const updated = await saveCompanyProfile(
        payload as Parameters<typeof saveCompanyProfile>[0],
      );
      setProfile(updated);
      setForm(mapProfileToFormValues(updated));
      showSuccess(SAVE_SUCCESS);
      return true;
    } catch (err) {
      const message = getHttpErrorMessage(err, SAVE_ERROR);
      setError(message);
      showError(SAVE_ERROR, message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, showError, showSuccess]);

  return {
    profile,
    form,
    loading,
    saving,
    error,
    setField,
    reset,
    reload: load,
    save,
  };
}
