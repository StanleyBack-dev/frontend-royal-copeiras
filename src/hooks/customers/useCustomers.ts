import { useCallback, useEffect, useState } from "react";
import {
  type Customer,
  type CreateCustomerPayload,
} from "../../api/customers/schema";
import {
  fetchCustomers,
  saveCustomer,
} from "../../features/customers/services/customer.service";
import { customerUiCopy } from "../../features/customers/model/messages";
import { useToast } from "../../shared/toast/useToast";

export interface UseCustomersResult {
  customers: Customer[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  load: () => Promise<void>;
  save: (
    formData: CreateCustomerPayload,
    editing?: Customer | null,
  ) => Promise<void>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

export function useCustomers(userId: string): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showError, showSuccess } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers(userId);
      setCustomers(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : customerUiCopy.errors.loadCustomersFallback;
      setError(message);
      showError(customerUiCopy.errors.loadCustomersFallback, message);
    } finally {
      setLoading(false);
    }
  }, [showError, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (formData: CreateCustomerPayload, editing?: Customer | null) => {
      setSaving(true);
      setError(null);
      try {
        await saveCustomer({ userId, formData, editing });
        showSuccess(
          editing
            ? customerUiCopy.success.updateCustomer
            : customerUiCopy.success.createCustomer,
        );
        await load();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : customerUiCopy.errors.saveCustomerFallback;
        setError(message);
        showError(customerUiCopy.errors.saveCustomerFallback, message);
      } finally {
        setSaving(false);
      }
    },
    [userId, load, showError, showSuccess],
  );

  return {
    customers,
    loading,
    saving,
    error,
    load,
    save,
    setCustomers,
  };
}
