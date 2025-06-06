import { useState, useEffect } from "react";

/**
 * Custom hook for handling pagination
 * @param {Array} data - The full data array to paginate
 * @param {Number} itemsPerPage - Number of items per page
 * @returns {Object} - Pagination state and handlers
 */
const usePagination = (data = [], itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    // Reset to first page when data changes
    setCurrentPage(1);
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setPaginatedData([]);
      setTotalPages(0);
      return;
    }

    // Calculate total pages
    const calculatedTotalPages = Math.ceil(data.length / itemsPerPage);
    setTotalPages(calculatedTotalPages);

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);

    // Extract data for current page
    const dataForCurrentPage = data.slice(startIndex, endIndex);
    setPaginatedData(dataForCurrentPage);
  }, [data, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return {
    currentPage,
    totalPages,
    paginatedData,
    handlePageChange,
  };
};

export default usePagination;
