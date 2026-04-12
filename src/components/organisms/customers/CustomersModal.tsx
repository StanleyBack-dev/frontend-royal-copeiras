// Organism: CustomersModal

import React from "react";
import { X } from "lucide-react";
import Input from "@atoms/Input";
import Select from "@atoms/Select";
import Textarea from "@atoms/Textarea";
import Button from "@atoms/Button";
import type { ICustomer } from "../../../types/client";
import { useState } from "react";
import { customerSchema } from '../../../validation/customer';
import { useNotification } from '../../notifications/NotificationProvider';
import { formatCPF, formatCNPJ, onlyDigits, formatPhone, formatLandline } from '../../../utils/format';

interface CustomersModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    form: Omit<ICustomer, "idCustomers" | "createdAt" | "updatedAt">,
  ) => void;
  saving: boolean;
  editing: ICustomer | null;
  initialForm: Omit<ICustomer, "idCustomers" | "createdAt" | "updatedAt">;
}

export default function CustomersModal({
  open,
  onClose,
  onSave,
  saving,
  editing,
  initialForm,
}: CustomersModalProps) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    cpf: '',
    cnpj: '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneType, setPhoneType] = useState<'cell' | 'landline'>('cell');
  const { notify } = useNotification();

  React.useEffect(() => {
    setForm({
      ...initialForm,
      cpf: '',
      cnpj: '',
    });
    setErrors({});
    setPhoneType('cell');
  }, [initialForm]);

  function validate(formData: typeof form) {
    // Garante que só o campo correto de documento será validado
    const data = { ...formData };
    if (data.type === 'individual') data.cnpj = '';
    if (data.type === 'company') data.cpf = '';
    const result = customerSchema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const key = typeof err.path[0] === 'symbol' ? String(err.path[0]) : (err.path[0] as string | number);
        if (key !== undefined) fieldErrors[String(key)] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Só envia o campo correto de documento
    const data = { ...form };
    if (data.type === 'individual') {
      data.document = data.cpf;
    } else if (data.type === 'company') {
      data.document = data.cnpj;
    }
    if (validate(data)) {
      try {
        await onSave(data);
        notify('Cliente salvo com sucesso!', 'success');
      } catch (err: unknown) {
        let message = 'Erro ao salvar cliente';
        if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string') {
          message = (err as { message: string }).message;
        }
        notify(message, 'error');
      }
    }
  }

  return open ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(44,24,16,0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "#e8d5c9" }}
        >
          <h3 className="font-bold text-lg" style={{ color: "#2C1810" }}>
            {editing ? "Editar Cliente" : "Novo Cliente"}
          </h3>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            style={{ color: "#9a7060", padding: 0, background: "none" }}
          >
            <X size={20} />
          </Button>
        </div>
        <form
          className="px-6 py-5 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Nome *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo ou razão social"
                required
                error={errors.name}
              />
            </div>
            <div>
              <Select
                label="Tipo"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as "individual" | "company",
                  })
                }
                error={errors.type}
              >
                <option value="individual">Pessoa Física</option>
                <option value="company">Empresa</option>
              </Select>
            </div>
            {/* Tipo de documento dinâmico */}
            {form.type === 'individual' && (
              <div>
                <Input
                  label="CPF *"
                  value={formatCPF(form.cpf || '')}
                  onChange={e => {
                    const raw = onlyDigits(e.target.value, 11);
                    setForm({ ...form, cpf: raw });
                  }}
                  placeholder="000.000.000-00"
                  error={errors.cpf}
                  maxLength={14}
                  disabled={form.type !== 'individual'}
                  inputMode="numeric"
                />
              </div>
            )}
            {form.type === 'company' && (
              <div>
                <Input
                  label="CNPJ *"
                  value={formatCNPJ(form.cnpj || '')}
                  onChange={e => {
                    const raw = onlyDigits(e.target.value, 14);
                    setForm({ ...form, cnpj: raw });
                  }}
                  placeholder="00.000.000/0000-00"
                  error={errors.cnpj}
                  maxLength={18}
                  disabled={form.type !== 'company'}
                  inputMode="numeric"
                />
              </div>
            )}
            <div>
              <Input
                label="Nascimento"
                value={form.birthDate || ""}
                onChange={(e) =>
                  setForm({ ...form, birthDate: e.target.value })
                }
                placeholder="Data de nascimento"
                type="date"
                error={errors.birthDate}
              />
            </div>
            <div>
              <Select
                label="Status"
                value={form.isActive ? "ativo" : "inativo"}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "ativo" })
                }
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Select>
            </div>
            <div className="col-span-2">
              <Input
                label="E-mail"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                type="email"
                error={errors.email}
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <Select
                  label="Tipo de Telefone"
                  value={phoneType}
                  onChange={e => setPhoneType(e.target.value as 'cell' | 'landline')}
                  style={{ marginBottom: 8 }}
                >
                  <option value="cell">Celular</option>
                  <option value="landline">Telefone Fixo</option>
                </Select>
              </div>
              <div>
                <Input
                  label={phoneType === 'cell' ? 'Celular' : 'Telefone Fixo'}
                  value={form.phone ? (phoneType === 'cell' ? formatPhone(form.phone) : formatLandline(form.phone)) : ''}
                  onChange={e => {
                    const raw = onlyDigits(e.target.value, phoneType === 'cell' ? 11 : 10);
                    setForm({ ...form, phone: raw });
                  }}
                  placeholder={phoneType === 'cell' ? '(11) 91234-5678' : '(11) 2345-6789'}
                  error={errors.phone}
                  maxLength={phoneType === 'cell' ? 15 : 14}
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="col-span-2">
              <Input
                label="Endereço"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, número, cidade/UF"
                error={errors.address}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="Observações"
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Notas adicionais..."
              />
            </div>
          </div>
          <div
            className="flex justify-end gap-3 pt-4 border-t"
            style={{ borderColor: "#e8d5c9" }}
          >
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
              style={{ background: "#f5ede8", color: "#7a4430" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              variant="primary"
              size="md"
              style={{
                background: "linear-gradient(135deg, #C9A227, #a8811a)",
              }}
              loading={saving}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
}
