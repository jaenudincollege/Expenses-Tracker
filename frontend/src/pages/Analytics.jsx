import { useEffect, useState } from "react";
import { expenseService, incomeService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency } from "../utils/helpers";
import { processApiError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";

const Analytics = () => {
  // Use auth context to ensure protected route works but no need to extract values
  useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expensesData, setExpensesData] = useState([]);
  const [incomesData, setIncomesData] = useState([]);
  const [period, setPeriod] = useState(90); // Default to 90 days

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [expensesResponse, incomesResponse] = await Promise.all([
          expenseService.getHistory(period),
          incomeService.getHistory(period),
        ]);

        setExpensesData(expensesResponse.data.expenses || []);
        setIncomesData(incomesResponse.data.incomes || []);
      } catch (err) {
        const errorResult = processApiError(err, {
          defaultMessage: "Failed to load analytics data",
        });
        setError(errorResult.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  // Calculate total expenses by category
  const expensesByCategory = expensesData.reduce((acc, expense) => {
    const category = expense.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(expense.amount);
    return acc;
  }, {});

  // Calculate total income by category
  const incomesByCategory = incomesData.reduce((acc, income) => {
    const category = income.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += parseFloat(income.amount);
    return acc;
  }, {});

  // Calculate monthly totals for the selected period
  const getMonthlyData = () => {
    const months = {};
    const now = new Date();

    // Get the starting date based on the selected period
    const startDate = new Date();
    startDate.setDate(now.getDate() - period);

    // Initialize months object with all months in the period
    for (let d = new Date(startDate); d <= now; d.setMonth(d.getMonth() + 1)) {
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      months[monthKey] = {
        expenses: 0,
        incomes: 0,
        savings: 0,
      };
    }

    // Add expenses data
    expensesData.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (months[monthKey]) {
        months[monthKey].expenses += parseFloat(expense.amount);
      }
    });

    // Add incomes data
    incomesData.forEach((income) => {
      const date = new Date(income.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (months[monthKey]) {
        months[monthKey].incomes += parseFloat(income.amount);
      }
    });

    // Calculate savings
    Object.keys(months).forEach((month) => {
      months[month].savings = months[month].incomes - months[month].expenses;
    });

    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data,
    }));
  };

  const monthlyData = getMonthlyData();

  // Calculate some overall statistics
  const totalExpenses = expensesData.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );
  const totalIncome = incomesData.reduce(
    (sum, income) => sum + parseFloat(income.amount),
    0
  );
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Get top expenses
  const topExpenses = [...expensesData]
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 5);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner
          size="large"
          message="Analyzing your financial data..."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Financial Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Analyze your financial data and trends
        </p>
      </header>
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}{" "}
      {/* Time Period Selector */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        {" "}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Select Time Period
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            className={`px-3 py-2 rounded-md text-sm sm:text-base sm:px-4 ${
              period === 30
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPeriod(30)}
          >
            Last 30 Days
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm sm:text-base sm:px-4 ${
              period === 90
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPeriod(90)}
          >
            Last 90 Days
          </button>{" "}
          <button
            className={`px-3 py-2 rounded-md text-sm sm:text-base sm:px-4 ${
              period === 180
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPeriod(180)}
          >
            Last 180 Days
          </button>
          <button
            className={`px-3 py-2 rounded-md text-sm sm:text-base sm:px-4 ${
              period === 365
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setPeriod(365)}
          >
            Last Year
          </button>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Total Income
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-gray-500 text-sm mt-2">Last {period} days</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Total Expenses
          </h2>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-gray-500 text-sm mt-2">Last {period} days</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Savings Rate
          </h2>
          <p className="text-3xl font-bold text-blue-600">
            {savingsRate.toFixed(2)}%
          </p>
          <p className="text-gray-500 text-sm mt-2">Income saved</p>
        </div>
      </div>
      {/* Monthly Trends */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Monthly Trends
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Month
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Income
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expenses
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Savings
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Savings Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyData.map((month) => {
                const savingsRate =
                  month.incomes > 0 ? (month.savings / month.incomes) * 100 : 0;

                return (
                  <tr key={month.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(`${month.month}-01`).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long" }
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {formatCurrency(month.incomes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {formatCurrency(month.expenses)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <span
                        className={
                          month.savings >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {formatCurrency(month.savings)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span
                          className={`font-semibold ${
                            savingsRate >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {savingsRate.toFixed(2)}%
                        </span>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              savingsRate >= 0 ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                Math.max(savingsRate, 0),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Expense Categories */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Expense Breakdown
          </h2>

          <ul className="space-y-4">
            {Object.entries(expensesByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = (amount / totalExpenses) * 100;

                return (
                  <li key={category} className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>
                      <span className="text-sm text-red-600 font-medium">
                        {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Income Categories */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Income Breakdown
          </h2>

          <ul className="space-y-4">
            {Object.entries(incomesByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => {
                const percentage = (amount / totalIncome) * 100;

                return (
                  <li key={category} className="flex flex-col">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {category}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      {/* Top Expenses */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Top Expenses
        </h2>

        {topExpenses.length > 0 ? (
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
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No expense data available
          </p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
