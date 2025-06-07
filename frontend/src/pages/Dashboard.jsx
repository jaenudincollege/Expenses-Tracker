import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  expenseService,
  incomeService,
  transactionService,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import DashboardSummary from "../components/DashboardSummary";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";
import usePagination from "../hooks/usePagination";
import notify from "../utils/toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import MobileActionBar from "../components/MobileActionBar";
import { formatDate } from "../utils/helpers"; // Import formatDate

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [periodFilter, setPeriodFilter] = useState(30);

  const fetchDashboardData = async (filter) => {
    const [expensesResponse, incomesResponse, transactionsResponse] =
      await Promise.all([
        expenseService.getHistory(filter),
        incomeService.getHistory(filter),
        transactionService.getHistory(filter),
      ]);
    return {
      expenses: expensesResponse.data,
      incomes: incomesResponse.data,
      transactions: transactionsResponse.data,
    };
  };

  const {
    data: dashboardData,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["dashboardData", periodFilter],
    queryFn: () => fetchDashboardData(periodFilter),
    keepPreviousData: true,
  });

  // Memoize the list of transactions to ensure a stable reference for usePagination
  const stableTransactionList = useMemo(() => {
    return dashboardData?.transactions?.transactions || [];
  }, [dashboardData?.transactions]); // Re-evaluate if the transactions object within dashboardData changes

  const {
    paginatedData: paginatedTransactions,
    currentPage: transactionsCurrentPage,
    totalPages: transactionsTotalPages,
    handlePageChange: handleTransactionsPageChange,
  } = usePagination(stableTransactionList, 10); // Use the memoized stable list

  const handlePeriodChange = (days) => {
    setPeriodFilter(days);
  };

  const downloadTransactionsMutation = useMutation({
    mutationFn: transactionService.downloadCSV,
    onMutate: () => {
      const loadingToastId = notify.loading(
        "Preparing transactions CSV download..."
      );
      return { loadingToastId };
    },
    onSuccess: (data, variables, context) => {
      if (context?.loadingToastId) {
        notify.dismiss(context.loadingToastId);
      }
      notify.success("Transactions CSV downloaded successfully");
    },
    onError: (error, variables, context) => {
      if (context?.loadingToastId) {
        notify.dismiss(context.loadingToastId);
      }
      notify.error("Failed to download transactions CSV");
      console.error(error);
    },
  });

  const handleDownloadTransactionsCSV = () => {
    downloadTransactionsMutation.mutate();
  };

  const handleLogout = () => {
    logout();
  };

  const monthlyData = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today);
      month.setMonth(today.getMonth() - i);
      const monthName = month.toLocaleString("default", { month: "short" });
      months.push({
        name: monthName,
        income: 0,
        expense: 0,
      });
    }

    const currentExpenses = dashboardData?.expenses?.expenses || [];
    const currentIncomes = dashboardData?.incomes?.incomes || [];

    currentExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthIndex =
        today.getMonth() -
        date.getMonth() +
        (today.getFullYear() - date.getFullYear()) * 12;
      if (monthIndex >= 0 && monthIndex < 6) {
        months[5 - monthIndex].expense += Math.abs(parseFloat(expense.amount));
      }
    });

    currentIncomes.forEach((income) => {
      const date = new Date(income.date);
      const monthIndex =
        today.getMonth() -
        date.getMonth() +
        (today.getFullYear() - date.getFullYear()) * 12;
      if (monthIndex >= 0 && monthIndex < 6) {
        months[5 - monthIndex].income += parseFloat(income.amount);
      }
    });

    return months;
  }, [dashboardData]);

  const categoryData = useMemo(() => {
    const currentExpenses = dashboardData?.expenses?.expenses || [];
    const categories = {};

    currentExpenses.forEach((expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0;
      }
      categories[expense.category] += Math.abs(parseFloat(expense.amount));
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [dashboardData]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  if (isLoading && !dashboardData)
    return (
      <div className="min-h-full flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading your financial data..." />
      </div>
    );

  return (
    <>
      <div className="pb-16 sm:pb-0">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Finance Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Welcome back, {currentUser?.user?.username || "User"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded transition-colors text-sm sm:text-base flex-shrink-0"
          >
            <span className="whitespace-nowrap">Logout</span>
          </button>
        </div>

        {isError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>
              {queryError?.response?.data?.message ||
                queryError?.message ||
                "Failed to fetch dashboard data"}
            </p>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2 sm:space-x-2 justify-start">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            Time period:
          </span>
          <button
            onClick={() => handlePeriodChange(7)}
            className={`px-3 py-1 text-sm rounded-md flex-shrink-0 ${
              periodFilter === 7
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => handlePeriodChange(30)}
            className={`px-3 py-1 text-sm rounded-md flex-shrink-0 ${
              periodFilter === 30
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            30 days
          </button>
          <button
            onClick={() => handlePeriodChange(90)}
            className={`px-3 py-1 text-sm rounded-md flex-shrink-0 ${
              periodFilter === 90
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            90 days
          </button>
          <button
            onClick={() => handlePeriodChange(365)}
            className={`px-3 py-1 text-sm rounded-md flex-shrink-0 ${
              periodFilter === 365
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            1 year
          </button>
        </div>

        <DashboardSummary
          expenses={dashboardData?.expenses}
          incomes={dashboardData?.incomes}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Income vs Expenses (Last 6 Months)
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar
                    dataKey="income"
                    name="Income"
                    fill="#4ade80"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expense"
                    name="Expense"
                    fill="#f87171"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Expense by Category
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Transactions
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:space-x-2 justify-start sm:justify-end">
              <button
                onClick={handleDownloadTransactionsCSV}
                disabled={
                  downloadTransactionsMutation.isPending ||
                  stableTransactionList.length === 0 // Use stableTransactionList here
                }
                className="text-sm px-3 py-2 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex-shrink-0"
              >
                <span className="whitespace-nowrap">Download CSV</span>
              </button>
              <Link
                to="/expenses"
                className="text-sm px-3 py-2 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex-shrink-0"
              >
                <span className="whitespace-nowrap">View All Expenses</span>
              </Link>
              <Link
                to="/incomes"
                className="text-sm px-3 py-2 sm:px-4 sm:py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex-shrink-0"
              >
                <span className="whitespace-nowrap">View All Incomes</span>
              </Link>
            </div>
          </div>

          {stableTransactionList.length > 0 ? ( // Use stableTransactionList here
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
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}{" "}
                          {/* Apply formatDate */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transaction.amount < 0
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {transaction.category}
                          </span>
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                            transaction.amount < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.amount < 0
                            ? `-$${Math.abs(
                                parseFloat(transaction.amount)
                              ).toFixed(2)}`
                            : `+$${parseFloat(transaction.amount).toFixed(2)}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.amount < 0 ? "Expense" : "Income"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {transactionsTotalPages > 1 && (
                <Pagination
                  currentPage={transactionsCurrentPage}
                  totalPages={transactionsTotalPages}
                  onPageChange={handleTransactionsPageChange}
                />
              )}
            </>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6 text-center">
              <p className="text-gray-500">
                No transactions found for this period.
              </p>
            </div>
          )}
        </div>
      </div>
      <MobileActionBar
        onDownloadCSV={handleDownloadTransactionsCSV}
        addLinkTo="/expenses/new"
        addLinkText="New Entry"
        isDownloadDisabled={
          downloadTransactionsMutation.isPending ||
          stableTransactionList.length === 0 // Use stableTransactionList here
        }
      />
    </>
  );
};

export default Dashboard;
