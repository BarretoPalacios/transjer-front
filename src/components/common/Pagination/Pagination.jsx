import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../Button/Button';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  startIndex,
  endIndex,
  className = ""
}) => {
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      onPageChange(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(
          <Button
            key={i}
            onClick={() => handlePageChange(i)}
            variant={currentPage === i ? 'primary' : 'secondary'}
            size="small"
            className="min-w-[40px]"
          >
            {i}
          </Button>
        );
      } else if (
        i === currentPage - 2 ||
        i === currentPage + 2
      ) {
        pages.push(
          <span key={i} className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }
    
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="text-sm text-gray-600 mb-4 sm:mb-0">
        Mostrando {startIndex + 1} - {endIndex} de {totalItems}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="secondary"
          size="small"
          icon={ChevronLeft}
        />
        
        {renderPageNumbers()}
        
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="secondary"
          size="small"
          icon={ChevronRight}
        />
      </div>
    </div>
  );
};

export default React.memo(Pagination);