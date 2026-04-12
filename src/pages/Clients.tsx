import { ClientsTable } from '../components/organisms/clients/ClientsTable';
import ClientsModal from '../components/organisms/clients/ClientsModal';
import ClientsFilterBar from '../components/molecules/ClientsFilterBar';
import { useState } from 'react';
import type { ICustomer } from '../types/client';

const emptyCustomer: Omit<ICustomer, 'idCustomers' | 'createdAt' | 'updatedAt'> = {
  name: '',
  document: '',
  type: 'individual',
  email: '',
  phone: '',
  birthDate: '',
  address: '',
  isActive: true,
};

export default function Clients() {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ICustomer | null>(null);
  const [form, setForm] = useState(emptyCustomer);
  const [saving, setSaving] = useState(false);

  // Aqui você deve buscar os dados do backend e popular setCustomers
  // Exemplo: useEffect(() => { fetchCustomers().then(setCustomers); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyCustomer);
    setShowModal(true);
  }

  function openEdit(customer: ICustomer) {
    setEditing(customer);
    setForm({
      name: customer.name,
      document: customer.document,
      type: customer.type,
      email: customer.email || '',
      phone: customer.phone || '',
      birthDate: customer.birthDate || '',
      address: customer.address || '',
      isActive: customer.isActive,
    });
    setShowModal(true);
  }

  function save(formData: Omit<ICustomer, 'idCustomers' | 'createdAt' | 'updatedAt'>) {
    if (!formData.name.trim()) return;
    setSaving(true);
    if (editing) {
      setCustomers(prev => prev.map(c => c.idCustomers === editing.idCustomers ? { ...editing, ...formData } : c));
    } else {
      setCustomers(prev => [
        { ...formData, idCustomers: Math.random().toString(36).slice(2), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        ...prev,
      ]);
    }
    setSaving(false);
    setShowModal(false);
  }

  function remove(id: string) {
    if (!confirm('Excluir este cliente?')) return;
    setCustomers(prev => prev.filter(c => c.idCustomers !== id));
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || '').includes(search)
  );

  return (
    <div className="space-y-6">
      <ClientsFilterBar search={search} setSearch={setSearch} onCreate={openCreate} />
      <ClientsTable
        clients={filtered}
        onEdit={openEdit}
        onRemove={remove}
      />
      <ClientsModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={save}
        saving={saving}
        editing={editing}
        initialForm={form}
      />
    </div>
  );
}
