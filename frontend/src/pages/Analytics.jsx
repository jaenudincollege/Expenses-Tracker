import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { expenseService, incomeService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, formatDate } from "../utils/helpers";
import { processApiError } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";

const Analytics = () => {
  useAuth();
  const [period, setPeriod] = useState(30);

  const fetchAnalyticsData = async (currentPeriod) => {
    const [expensesResponse, incomesResponse] = await Promise.all([
      expenseService.getHistory(currentPeriod),
      incomeService.getHistory(currentPeriod),
    ]);
    return {
      expenses: expensesResponse.data.expenses || [],
      incomes: incomesResponse.data.incomes || [],
    };
  };

  const {
    data: analyticsReport,
    isLoading,
    isError: queryIsError,
    error: queryError,
  } = useQuery({
    queryKey: ["analyticsData", period],
    queryFn: () => fetchAnalyticsData(period),
    select: (rawData) => {
      const expensesData = rawData?.expenses || [];
      const incomesData = rawData?.incomes || [];

      const expensesByCategory = expensesData.reduce((acc, expense) => {
        const category = expense.category || "Uncategorized";
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(expense.amount);
        return acc;
      }, {});

      const incomesByCategory = incomesData.reduce((acc, income) => {
        const category = income.source || "Uncategorized";
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(income.amount);
        return acc;
      }, {});

      const monthlyData = (() => {
        const months = {};
        const now = new Date();
        let startDate = new Date(now);
        startDate.setDate(startDate.getDate() - period + 1);

        let iterDate = new Date(startDate);
        while (iterDate <= now) {
          const monthKey = `${iterDate.getFullYear()}-${String(
            iterDate.getMonth() + 1
          ).padStart(2, "0")}`;
          if (!months[monthKey]) {
            months[monthKey] = { expenses: 0, incomes: 0, savings: 0 };
          }
          iterDate.setMonth(iterDate.getMonth() + 1);
          iterDate.setDate(1);
        }
        const currentMonthKey = `${now.getFullYear()}-${String(
          now.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!months[currentMonthKey]) {
          months[currentMonthKey] = { expenses: 0, incomes: 0, savings: 0 };
        }

        expensesData.forEach((expense) => {
          const date = new Date(expense.date);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          if (months[monthKey]) {
            months[monthKey].expenses += parseFloat(expense.amount);
          }
        });

        incomesData.forEach((income) => {
          const date = new Date(income.date);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          if (months[monthKey]) {
            months[monthKey].incomes += parseFloat(income.amount);
          }
        });

        Object.keys(months).forEach((month) => {
          months[month].savings =
            months[month].incomes - Math.abs(months[month].expenses);
        });

        return Object.entries(months)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));
      })();

      const totalExpenses = expensesData.reduce(
        (sum, expense) => sum + parseFloat(expense.amount),
        0
      );
      const totalIncome = incomesData.reduce(
        (sum, income) => sum + parseFloat(income.amount),
        0
      );

      const topExpenses = [...expensesData]
        .sort(
          (a, b) =>
            Math.abs(parseFloat(b.amount)) - Math.abs(parseFloat(a.amount))
        )
        .slice(0, 5);

      return {
        expensesData,
        incomesData,
        expensesByCategory,
        incomesByCategory,
        monthlyData,
        totalExpenses,
        totalIncome,
        topExpenses,
      };
    },
    placeholderData: (previousData) => previousData,
    keepPreviousData: true,
  });

  const apiError = useMemo(() => {
    if (queryError) {
      const errorResult = processApiError(queryError, {
        defaultMessage: "Failed to load analytics data",
      });
      return errorResult.message;
    }
    return null;
  }, [queryError]);

  if (isLoading && !analyticsReport) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner
          size="large"
          message="Analyzing your financial data..."
        />
      </div>
    );
  }

  const {
    expensesByCategory = {},
    incomesByCategory = {},
    monthlyData = [],
    totalExpenses = 0,
    totalIncome = 0,
    topExpenses = [],
  } = analyticsReport || {};

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <header className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Financial Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          Analyze your financial data and trends for the last {period} days.
        </p>
      </header>
      {queryIsError && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{apiError}</p>
        </div>
      )}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Select Time Period
        </h2>
        <div className="flex flex-wrap gap-3">
          {[7, 30, 90, 180, 365].map((p) => (
            <button
              key={p}
              className={`px-3 py-2 rounded-md text-sm sm:text-base sm:px-4 ${
                period === p
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setPeriod(p)}
            >
              Last {p === 365 ? "Year" : `${p} Days`}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Total Income
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Total Expenses
          </h2>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(Math.abs(totalExpenses))}
          </p>
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Net Savings
          </h2>
          <p
            className={`text-3xl font-bold ${
              totalIncome - Math.abs(totalExpenses) >= 0
                ? "text-blue-600"
                : "text-orange-500"
            }`}
          >
            {formatCurrency(totalIncome - Math.abs(totalExpenses))}
          </p>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Monthly Trends
        </h2>
        {monthlyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Income
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.map((item) => (
                  <tr key={item.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(new Date(item.month + "-02"))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(item.incomes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(Math.abs(item.expenses))}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        item.savings >= 0 ? "text-blue-600" : "text-orange-500"
                      }`}
                    >
                      {formatCurrency(item.savings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No monthly data available for the selected period.
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Expense Breakdown by Category
          </h2>
          {Object.keys(expensesByCategory).length > 0 ? (
            <ul className="space-y-3">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                .map(([category, amount]) => (
                  <li
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-700">{category}</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(Math.abs(amount))}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No expense data for breakdown.</p>
          )}
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Income Breakdown by Source
          </h2>
          {Object.keys(incomesByCategory).length > 0 ? (
            <ul className="space-y-3">
              {Object.entries(incomesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <li
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-700">{category}</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(amount)}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500">No income data for breakdown.</p>
          )}
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Top 5 Expenses
        </h2>
        {topExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      {formatCurrency(Math.abs(expense.amount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            No expenses recorded for this period.
          </p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
