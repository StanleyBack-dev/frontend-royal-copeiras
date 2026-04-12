import { Plus, Search } from "lucide-react";
import SearchBar from "../atoms/SearchBar";
import Button from "../atoms/Button";

interface CustomersFilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  onCreate: () => void;
}

export default function CustomersFilterBar({
  search,
  setSearch,
  onCreate,
}: CustomersFilterBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar clientes..."
        icon={<Search size={16} style={{ color: "#9a7060" }} />}
      />
      <Button leftIcon={<Plus size={16} />} onClick={onCreate}>
        Novo Cliente
      </Button>
    </div>
  );
}
