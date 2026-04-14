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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCustomers(userId);
      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : customerUiCopy.errors.loadCustomersFallback,
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (formData: CreateCustomerPayload, editing?: Customer | null) => {
      setSaving(true);
      setError(null);
      try {
        await saveCustomer({ userId, formData, editing });
        await load();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : customerUiCopy.errors.saveCustomerFallback,
        );
      } finally {
        setSaving(false);
      }
    },
    [userId, load],
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
