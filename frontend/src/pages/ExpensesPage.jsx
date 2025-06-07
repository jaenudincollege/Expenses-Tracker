import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { expenseService } from "../services/api";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import usePagination from "../hooks/usePagination";
import notify from "../utils/toast";
import { processApiError } from "../utils/errorHandler"; // Added for error handling
import { formatDate } from "../utils/helpers"; // Import formatDate

const ExpensesPage = () => {
  const {
    data: expensesData,
    isLoading: isLoadingExpenses,
    isError: isLoadError,
    error: loadError,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const response = await expenseService.getAll();
      return response.data?.expenses || response.data || [];
    },
    placeholderData: [], // Keep previous data while loading new data
  });

  const downloadCsvMutation = useMutation({
    mutationFn: expenseService.downloadCSV,
    onMutate: () => {
      return notify.loading("Preparing expenses CSV download...");
    },
    onSuccess: (data, variables, context) => {
      notify.dismiss(context);
      notify.success("Expenses CSV downloaded successfully");
      // Download is handled by the browser
    },
    onError: (error, variables, context) => {
      notify.dismiss(context);
      const errorResult = processApiError(error, {
        defaultMessage: "Failed to download expenses CSV",
      });
      notify.error(errorResult.message);
      console.error(error);
    },
  });

  const handleDownloadCsv = () => {
    if (expensesData && expensesData.length > 0) {
      downloadCsvMutation.mutate();
    } else {
      notify.info("No expenses to download.");
    }
  };

  // Use pagination hook for expenses
  const {
    paginatedData: paginatedExpenses,
    currentPage: expensesCurrentPage,
    totalPages: expensesTotalPages,
    handlePageChange: handleExpensesPageChange,
  } = usePagination(expensesData || [], 10); // Use expensesData from useQuery

  if (isLoadingExpenses) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading expense data..." />
      </div>
    );
  }

  if (isLoadError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-md">
          <p className="font-bold">Error Loading Expenses</p>
          <p>
            {loadError?.response?.data?.message ||
              loadError?.message ||
              "Failed to load expenses."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 sm:pb-0">
      {" "}
      {/* Added padding for MobileActionBar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>
        <div className="flex flex-wrap items-center space-x-2 gap-2 sm:gap-0">
          <button
            onClick={handleDownloadCsv}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors flex items-center text-sm sm:text-base whitespace-nowrap"
            disabled={
              downloadCsvMutation.isPending ||
              !expensesData ||
              expensesData.length === 0
            }
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
            {downloadCsvMutation.isPending ? "Downloading..." : "Download CSV"}
          </button>
          <Link
            to="/expenses/new"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md transition-colors flex items-center text-sm sm:text-base whitespace-nowrap"
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
            Add New Expense
          </Link>
        </div>
      </div>
      {paginatedExpenses.length === 0 && !isLoadingExpenses ? (
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
            No Expense Records Found
          </h2>
          <p className="text-gray-500 mb-4">
            Start tracking your expenses by adding your first record.
          </p>
          <Link
            to="/expenses/new"
            className="inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
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
            Add Your First Expense
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
                {paginatedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)} {/* Apply formatDate */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -${Math.abs(parseFloat(expense.amount)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        to={`/expenses/edit/${expense.id}`}
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

          {expensesTotalPages > 1 && (
            <Pagination
              currentPage={expensesCurrentPage}
              totalPages={expensesTotalPages}
              onPageChange={handleExpensesPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExpensesPage;
