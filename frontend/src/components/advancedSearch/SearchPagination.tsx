import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

type SearchPaginationProps = {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
};

export function SearchPagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: SearchPaginationProps) {
  return (
    <div className="searchResults__pagination">
      <button type="button" onClick={onPrevious} disabled={page <= 1}>
        <FiChevronLeft />
      </button>

      <span>
        Página {page} de {totalPages}
      </span>

      <button type="button" onClick={onNext} disabled={page >= totalPages}>
        <FiChevronRight />
      </button>
    </div>
  );
}
