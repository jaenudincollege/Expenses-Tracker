import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomeService } from "../services/api";
import { processApiError } from "../utils/errorHandler";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";

const IncomeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const isEditMode = !!id;

  const {
    isLoading: isLoadingIncome,
    isError: isLoadError,
    error: loadError,
  } = useQuery({
    queryKey: ["income", id],
    queryFn: async () => {
      const response = await incomeService.getById(id);
      return response.data?.income || response.data;
    },
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data) {
        const formData = {
          ...data,
          date: data.date
            ? new Date(data.date).toISOString().split("T")[0]
            : "",
          amount: Math.abs(data.amount),
        };
        reset(formData);
      }
    },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
      };
      if (isEditMode) {
        return incomeService.update(id, formattedData);
      } else {
        return incomeService.create(formattedData);
      }
    },
    onSuccess: () => {
      toast.success(
        `Income ${isEditMode ? "updated" : "created"} successfully!`
      );
      queryClient.invalidateQueries(["incomes"]);
      queryClient.invalidateQueries(["income", id]);
      queryClient.invalidateQueries(["dashboardData"]);
      navigate(isEditMode ? `/incomes/${id}` : "/incomes");
    },
    onError: (err) => {
      const errorResult = processApiError(err, {
        defaultMessage: `Failed to ${isEditMode ? "update" : "create"} income`,
      });
      toast.error(errorResult.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoadingIncome && isEditMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading income data..." />
      </div>
    );
  }

  if (isLoadError && isEditMode) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error Loading Income</p>
          <p>
            {loadError?.response?.data?.message ||
              loadError?.message ||
              "Failed to load income details for editing."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-green-600 mb-6">
          {isEditMode ? "Edit Income" : "Add New Income"}
        </h2>

        {mutation.isError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            <p>
              {mutation.error?.response?.data?.message ||
                mutation.error?.message ||
                `Failed to ${isEditMode ? "update" : "create"} income`}
            </p>
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
              disabled={mutation.isPending || (isEditMode && isLoadingIncome)}
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
                placeholder="100.00"
                className={`shadow appearance-none border ${
                  errors.amount ? "border-red-500" : "border-gray-300"
                } rounded w-full py-2 px-3 pl-8 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                {...register("amount", {
                  required: "Amount is required",
                  valueAsNumber: true,
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than zero",
                  },
                })}
                disabled={mutation.isPending || (isEditMode && isLoadingIncome)}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.amount.message}
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
              disabled={mutation.isPending || (isEditMode && isLoadingIncome)}
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
              disabled={mutation.isPending || (isEditMode && isLoadingIncome)}
            />
            {errors.date && (
              <p className="text-red-500 text-xs italic mt-1">
                {errors.date.message}
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
              rows="3"
              className={`shadow appearance-none border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
              {...register("description")}
              disabled={mutation.isPending || (isEditMode && isLoadingIncome)}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={mutation.isPending || (isEditMode && isLoadingIncome)}
            >
              {mutation.isPending
                ? "Saving..."
                : isEditMode
                ? "Update Income"
                : "Add Income"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={mutation.isPending}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;
