interface ListPagerPagination {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
}

interface ListPagerProps {
  pagination: ListPagerPagination;
  loading?: boolean;
  onLimitChange: (limit: number) => void;
  onPrev: () => void;
  onNext: () => void;
  limitOptions?: number[];
}

export default function ListPager({
  pagination,
  loading = false,
  onLimitChange,
  onPrev,
  onNext,
  limitOptions = [5, 10, 20, 50],
}: ListPagerProps) {
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-brown-700">
      <span>
        Página {pagination.currentPage} de {Math.max(pagination.totalPages, 1)}
        {" - "}
        {pagination.total} registros
      </span>
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2">
          <span>Itens:</span>
          <select
            className="rounded border border-brown-300 bg-white px-2 py-1"
            value={pagination.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            disabled={loading}
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
          onClick={onPrev}
          disabled={loading || pagination.currentPage <= 1}
        >
          Anterior
        </button>
        <button
          type="button"
          className="rounded border border-brown-300 px-3 py-1 disabled:opacity-50"
          onClick={onNext}
          disabled={loading || !pagination.hasNextPage}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
