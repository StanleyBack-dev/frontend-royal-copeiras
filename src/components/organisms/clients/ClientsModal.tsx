// Organism: ClientsModal

import React from 'react';
import { X } from 'lucide-react';
import Input from '@atoms/Input';
import Select from '@atoms/Select';
import Textarea from '@atoms/Textarea';
import Button from '@atoms/Button';
import type { ICustomer } from '../../../types/client';
import { useState } from 'react';


interface ClientsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (form: Omit<ICustomer, 'idCustomers' | 'createdAt' | 'updatedAt'>) => void;
  saving: boolean;
  editing: ICustomer | null;
  initialForm: Omit<ICustomer, 'idCustomers' | 'createdAt' | 'updatedAt'>;
}

export default function ClientsModal({ open, onClose, onSave, saving, editing, initialForm }: ClientsModalProps) {
  const [form, setForm] = useState(initialForm);

  // Atualiza o form se o cliente em edição mudar
  React.useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  return open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(44,24,16,0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#e8d5c9' }}>
          <h3 className="font-bold text-lg" style={{ color: '#2C1810' }}>
            {editing ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <Button onClick={onClose} variant="secondary" size="sm" style={{ color: '#9a7060', padding: 0, background: 'none' }}>
            <X size={20} />
          </Button>
        </div>
        <form
          className="px-6 py-5 space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Nome *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Nome completo ou razão social"
                required
              />
            </div>
            <div>
              <Select
                label="Tipo"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as 'individual' | 'company' })}
              >
                <option value="individual">Pessoa Física</option>
                <option value="company">Empresa</option>
              </Select>
            </div>
            <div>
              <Input
                label="CPF / CNPJ"
                value={form.document || ''}
                onChange={e => setForm({ ...form, document: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Input
                label="Nascimento"
                value={form.birthDate || ''}
                onChange={e => setForm({ ...form, birthDate: e.target.value })}
                placeholder="Data de nascimento"
                type="date"
              />
            </div>
            <div>
              <Select
                label="Status"
                value={form.isActive ? 'ativo' : 'inativo'}
                onChange={e => setForm({ ...form, isActive: e.target.value === 'ativo' })}
              >
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Select>
            </div>
            <div>
              <Input
                label="E-mail"
                value={form.email || ''}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                type="email"
              />
            </div>
            <div>
              <Input
                label="Telefone"
                value={form.phone || ''}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Endereço"
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Rua, número, cidade/UF"
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="Observações"
                value={form.notes || ''}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                rows={3}
                placeholder="Notas adicionais..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: '#e8d5c9' }}>
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
              style={{ background: '#f5ede8', color: '#7a4430' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              variant="primary"
              size="md"
              style={{ background: 'linear-gradient(135deg, #C9A227, #a8811a)' }}
              loading={saving}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;
}
