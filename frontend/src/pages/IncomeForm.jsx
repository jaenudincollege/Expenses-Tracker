import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { incomeService } from "../services/api";
import { processApiError } from "../utils/errorHandler";
import toast from "react-hot-toast";
import { formatCurrency, formatDate } from "../utils/helpers";

const IncomeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [income, setIncome] = useState(null);
  const isEditMode = !!id;
  useEffect(() => {
    const loadIncome = async () => {
      if (isEditMode) {
        try {
          setLoading(true);
          const response = await incomeService.getById(id);
          // Handle nested data structure - direct access or through income property
          const incomeData = response.data?.income || response.data;
          setIncome(incomeData);
          reset(incomeData);
        } catch (err) {
          setError("Failed to load income");
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadIncome();
  }, [id, reset, isEditMode]);
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      if (isEditMode) {
        const response = await incomeService.update(id, data);
        toast.success("Income updated successfully!");
        navigate("/dashboard");
        return response;
      } else {
        const response = await incomeService.create(data);
        toast.success("Income created successfully!");
        navigate("/dashboard");
        return response;
      }
    } catch (err) {
      const errorResult = processApiError(err, {
        defaultMessage: `Failed to ${isEditMode ? "update" : "create"} income`,
      });
      setError(errorResult.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      {" "}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-green-600 mb-6">
          {isEditMode ? "Edit Income" : "Add New Income"}
        </h2>

        {isEditMode && income && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Current Income Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Amount:</span>{" "}
                {formatCurrency(income.amount)}
              </div>
              <div>
                <span className="font-semibold">Date:</span>{" "}
                {formatDate(income.date)}
              </div>
              <div>
                <span className="font-semibold">Category:</span>{" "}
                {income.category}
              </div>
              {income.description && (
                <div className="col-span-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {income.description}
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Title
            </label>
            <input
              id="title"
              className={`shadow appearance-none border ${
                errors.title ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="amount"
            >
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-700">
                $
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                className={`shadow appearance-none border ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                } rounded w-full py-2 px-3 pl-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 0, message: "Amount must be positive" },
                })}
              />
            </div>{" "}
            {errors.amount && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.amount.message}
              </p>
            )}
            {isEditMode && income && (
              <p className="text-gray-500 text-xs mt-1">
                Current amount: {formatCurrency(income.amount)}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="category"
            >
              Category
            </label>
            <select
              id="category"
              className={`shadow appearance-none border ${
                errors.category ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              {...register("category", { required: "Category is required" })}
            >
              <option value="">Select a category</option>
              <option value="Salary">Salary</option>
              <option value="Freelance">Freelance</option>
              <option value="Investments">Investments</option>
              <option value="Rental">Rental Income</option>
              <option value="Gifts">Gifts</option>
              <option value="Other">Other</option>
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="date"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              className={`shadow appearance-none border ${
                errors.date ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              {...register("date", { required: "Date is required" })}
            />{" "}
            {errors.date && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.date.message}
              </p>
            )}
            {isEditMode && income && (
              <p className="text-gray-500 text-xs mt-1">
                Current date: {formatDate(income.date, { weekday: "long" })}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              {...register("description")}
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing
                </span>
              ) : (
                "Save Income"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;
