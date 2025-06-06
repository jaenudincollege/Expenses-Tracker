import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
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

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodFilter, setPeriodFilter] = useState(30); // Default to 30 days

  // Use pagination hook for transactions only (no need to show expenses and incomes tables on dashboard)
  const {
    paginatedData: paginatedTransactions,
    currentPage: transactionsCurrentPage,
    totalPages: transactionsTotalPages,
    handlePageChange: handleTransactionsPageChange,
  } = usePagination(transactions?.transactions || [], 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get data for the last 30 days
        const [expensesResponse, incomesResponse, transactionsResponse] =
          await Promise.all([
            expenseService.getHistory(30),
            incomeService.getHistory(30),
            transactionService.getHistory(30),
          ]); // Store the complete response object to handle nested data structure
        setExpenses(expensesResponse.data);
        setIncomes(incomesResponse.data);
        setTransactions(transactionsResponse.data);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadExpensesCSV = async () => {
    try {
      const response = await expenseService.downloadCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV");
      console.error(err);
    }
  };

  const handleDownloadIncomesCSV = async () => {
    try {
      const response = await incomeService.downloadCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "incomes.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV");
      console.error(err);
    }
  };

  const handleDownloadTransactionsCSV = async () => {
    try {
      const response = await transactionService.downloadCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to download CSV");
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
  };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading your financial data..." />
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="bg-white shadow-md rounded-lg p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Finance Dashboard
        </h1>{" "}
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <p className="text-gray-700">
            Welcome,{" "}
            <span className="font-semibold capitalize">
              {currentUser?.user?.username || "User"}
            </span>
          </p>
          <Link
            to="/analytics"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            View Analytics
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </header>{" "}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      {/* Financial Summary Section */}
      <DashboardSummary expenses={expenses} incomes={incomes} />
      <section className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            Expenses
          </h2>
          <div className="flex gap-3">
            <Link
              to="/expenses/new"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Add New
            </Link>
            <button
              onClick={handleDownloadExpensesCSV}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Download CSV
            </button>
          </div>
        </div>{" "}
        {expenses?.expenses?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Amount
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
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {expense.title}
                      </td>{" "}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        ${Math.abs(parseFloat(expense.amount)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/expenses/${expense.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <Link
                            to={`/expenses/edit/${expense.id}`}
                            className="text-blue-600 hover:text-blue-900 ml-3"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for expenses */}
            {expensesTotalPages > 1 && (
              <Pagination
                currentPage={expensesCurrentPage}
                totalPages={expensesTotalPages}
                onPageChange={handleExpensesPageChange}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-6">No expenses found</p>
        )}
      </section>{" "}
      <section className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            Incomes
          </h2>
          <div className="flex gap-3">
            <Link
              to="/incomes/new"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Add New
            </Link>
            <button
              onClick={handleDownloadIncomesCSV}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Download CSV
            </button>
          </div>
        </div>{" "}
        {incomes?.incomes?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Amount
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
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedIncomes.map((income) => (
                    <tr key={income.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {income.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        ${parseFloat(income.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(income.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/incomes/${income.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </Link>
                          <Link
                            to={`/incomes/edit/${income.id}`}
                            className="text-blue-600 hover:text-blue-900 ml-3"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for incomes */}
            {incomesTotalPages > 1 && (
              <Pagination
                currentPage={incomesCurrentPage}
                totalPages={incomesTotalPages}
                onPageChange={handleIncomesPageChange}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-6">No incomes found</p>
        )}
      </section>{" "}
      <section className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 md:mb-0">
            Recent Transactions
          </h2>
          <button
            onClick={handleDownloadTransactionsCSV}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Download CSV
          </button>
        </div>{" "}
        {transactions?.transactions?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Amount
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
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.title}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          transaction.amount < 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        ${Math.abs(parseFloat(transaction.amount)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            transaction.amount < 0
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {transaction.amount < 0 ? "Expense" : "Income"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination for transactions */}
            {transactionsTotalPages > 1 && (
              <Pagination
                currentPage={transactionsCurrentPage}
                totalPages={transactionsTotalPages}
                onPageChange={handleTransactionsPageChange}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-6">
            No transactions found
          </p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
