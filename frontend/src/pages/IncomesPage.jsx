import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query"; // Removed useQueryClient
import { incomeService } from "../services/api";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import usePagination from "../hooks/usePagination";
import notify from "../utils/toast";
import { formatDate } from "../utils/helpers"; // Import formatDate

const IncomesPage = () => {
  const {
    data: incomesData,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["incomes"],
    queryFn: async () => {
      const response = await incomeService.getAll();
      return response.data?.incomes || response.data;
    },
  });

  const incomes = incomesData || [];

  const {
    paginatedData: paginatedIncomes,
    currentPage: incomesCurrentPage,
    totalPages: incomesTotalPages,
    handlePageChange: handleIncomesPageChange,
  } = usePagination(incomes, 10);

  const downloadMutation = useMutation({
    mutationFn: incomeService.downloadCSV,
    onMutate: () => {
      const loadingToastId = notify.loading(
        "Preparing incomes CSV download..."
      );
      return { loadingToastId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.loadingToastId) {
        notify.dismiss(context.loadingToastId);
      }
      notify.success("Incomes CSV downloaded successfully");
    },
    onError: (error, variables, context) => {
      if (context?.loadingToastId) {
        notify.dismiss(context.loadingToastId);
      }
      notify.error("Failed to download incomes CSV");
      console.error(error);
    },
  });

  const handleDownloadCsv = () => {
    downloadMutation.mutate();
  };

  if (isLoading)
    return (
      <div className="min-h-full flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading income data..." />
      </div>
    );

  if (isError)
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
        <p>{queryError?.message || "Failed to load incomes"}</p>
      </div>
    );

  return (
    <>
      <div className="pb-16 sm:pb-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Income Management
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:space-x-2 justify-start sm:justify-end">
            <button
              onClick={handleDownloadCsv}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors flex items-center text-sm sm:text-base flex-shrink-0"
              disabled={downloadMutation.isPending || incomes.length === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="whitespace-nowrap">Download CSV</span>
            </button>
            <Link
              to="/incomes/new"
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors flex items-center text-sm sm:text-base flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="whitespace-nowrap">Add New Income</span>
            </Link>
          </div>
        </div>

        {paginatedIncomes.length === 0 && !isLoading ? (
          <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No Income Records Found
            </h2>
            <p className="text-gray-500 mb-4">
              Start tracking your income by adding your first record.
            </p>
            <Link
              to="/incomes/new"
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="whitespace-nowrap">Add Your First Income</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedIncomes.map((income) => (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(income.date)} {/* Apply formatDate */}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {income.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {income.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        +${parseFloat(income.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/incomes/${income.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          to={`/incomes/edit/${income.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {incomesTotalPages > 1 && (
              <Pagination
                currentPage={incomesCurrentPage}
                totalPages={incomesTotalPages}
                onPageChange={handleIncomesPageChange}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default IncomesPage;
