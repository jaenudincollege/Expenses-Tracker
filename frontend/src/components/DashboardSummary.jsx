import React, { useMemo } from "react";

const DashboardSummary = ({ expenses, incomes }) => {
  const stats = useMemo(() => {
    // Extract the actual arrays from the nested structure if needed
    const expensesArray = expenses?.expenses || [];
    const incomesArray = incomes?.incomes || []; // Calculate total expenses (expenses are stored as negative values)
    const totalExpenses = expensesArray.reduce(
      (sum, expense) => sum + parseFloat(expense.amount),
      0
    );

    // Calculate total income
    const totalIncome = incomesArray.reduce(
      (sum, income) => sum + parseFloat(income.amount),
      0
    );

    // Calculate net balance (since expenses are already negative, we add them to income)
    const netBalance = totalIncome + totalExpenses;

    // Get count of transactions
    const expenseCount = expensesArray.length;
    const incomeCount = incomesArray.length;

    // Category breakdowns for expenses
    const expenseCategories = {};
    expensesArray.forEach((expense) => {
      if (!expenseCategories[expense.category]) {
        expenseCategories[expense.category] = 0;
      }
      expenseCategories[expense.category] += parseFloat(expense.amount);
    });

    // Category breakdowns for incomes
    const incomeCategories = {};
    incomesArray.forEach((income) => {
      if (!incomeCategories[income.category]) {
        incomeCategories[income.category] = 0;
      }
      incomeCategories[income.category] += parseFloat(income.amount);
    });

    // Find top expense categories
    const topExpenseCategories = Object.entries(expenseCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Find top income categories
    const topIncomeCategories = Object.entries(incomeCategories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return {
      totalExpenses,
      totalIncome,
      netBalance,
      expenseCount,
      incomeCount,
      topExpenseCategories,
      topIncomeCategories,
    };
  }, [expenses, incomes]);

  return (
    <section className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Financial Summary
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Net Balance Card */}
        <div
          className={`rounded-lg p-6 ${
            stats.netBalance >= 0 ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <h3 className="text-lg font-medium text-gray-700">Net Balance</h3>
          <p
            className={`text-2xl font-bold ${
              stats.netBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${Math.abs(stats.netBalance).toFixed(2)}
            <span className="text-sm font-normal ml-1">
              {stats.netBalance >= 0 ? "positive" : "negative"}
            </span>
          </p>
        </div>

        {/* Income Card */}
        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-700">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            ${stats.totalIncome.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.incomeCount} transactions
          </p>
        </div>

        {/* Expense Card */}
        <div className="bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-700">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            ${Math.abs(stats.totalExpenses.toFixed(2))}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.expenseCount} transactions
          </p>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Expense Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Top Expense Categories
          </h3>
          {stats.topExpenseCategories.length > 0 ? (
            <ul className="space-y-3">
              {stats.topExpenseCategories.map(([category, amount]) => (
                <li
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-700">{category}</span>
                  <span className="text-red-600 font-medium">
                    ${Math.abs(amount.toFixed(2))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No expense data available</p>
          )}
        </div>

        {/* Top Income Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Top Income Categories
          </h3>
          {stats.topIncomeCategories.length > 0 ? (
            <ul className="space-y-3">
              {stats.topIncomeCategories.map(([category, amount]) => (
                <li
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span className="text-gray-700">{category}</span>
                  <span className="text-green-600 font-medium">
                    ${amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No income data available</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardSummary;
