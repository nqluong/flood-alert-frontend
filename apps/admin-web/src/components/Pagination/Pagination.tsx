import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
  itemLabel?: string; // e.g., "người dùng", "cảm biến", "báo cáo"
}

export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  isFirstPage,
  isLastPage,
  onPageChange,
  itemLabel = 'mục',
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Trước
      </button>

      {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
        <button
          key={i}
          className={`pagination__btn ${i === currentPage ? 'pagination__btn--active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pagination__btn"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Tiếp
      </button>

      <span className="pagination__info">
        Trang {currentPage + 1} / {totalPages} &nbsp;·&nbsp; {totalElements} {itemLabel}
      </span>
    </div>
  );
}
