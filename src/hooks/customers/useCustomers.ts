import { useCallback, useEffect, useState } from "react";
import { getCustomers } from "../../api/customers/methods/get";
import { createCustomer } from "../../api/customers/methods/create";
import { updateCustomer } from "../../api/customers/methods/update";
import {
  CustomerSchema,
  CreateCustomerPayloadSchema,
  Customer,
  CreateCustomerPayload,
} from "../../api/customers/schema";

interface UseCustomersResult {
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
      const data = await getCustomers(userId);
      const parsed = CustomerSchema.array().safeParse(data);
      if (parsed.success) {
        setCustomers(parsed.data);
      } else {
        setError("Dados de clientes inválidos");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar clientes",
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
        const parsed = CreateCustomerPayloadSchema.safeParse(formData);
        if (!parsed.success) {
          setError("Dados do cliente inválidos");
          return;
        }
        if (editing) {
          await updateCustomer(editing.idCustomers, parsed.data, userId);
        } else {
          await createCustomer(parsed.data, userId);
        }
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar cliente");
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
