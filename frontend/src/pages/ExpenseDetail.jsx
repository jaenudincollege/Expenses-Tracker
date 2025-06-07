import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner"; // Added for consistency
import notify from "../utils/toast"; // Added for notifications
import { formatDate } from "../utils/helpers"; // Import formatDate

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: expense,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["expense", id],
    queryFn: async () => {
      const response = await expenseService.getById(id);
      return response.data?.expense || response.data;
    },
    enabled: !!id, // Only run query if id is available
  });

  const deleteMutation = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      notify.success("Expense deleted successfully");
      queryClient.invalidateQueries(["expenses"]); // Invalidate list to refetch
      queryClient.invalidateQueries(["dashboardData"]); // Invalidate dashboard data
      navigate("/expenses"); // Navigate to expenses list or dashboard
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || "Failed to delete expense");
      console.error(error);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading expense details..." />
      </div>
    );

  if (isError)
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>
            {queryError?.response?.data?.message ||
              queryError?.message ||
              "Failed to load expense details"}
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

  if (!expense && !isLoading)
    // Added !isLoading to prevent flash of "Not Found"
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-bold">Not Found</p>
          <p>The expense you're looking for could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-red-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Expense Detail</h2>
        </div>
        <div className="p-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Title</div>
            <div className="text-lg font-semibold">{expense.title}</div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Amount</div>
            <div className="text-lg font-semibold text-red-600">
              -${Math.abs(expense.amount).toFixed(2)}
            </div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Category</div>
            <div className="text-lg font-semibold">
              <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                {expense.category}
              </span>
            </div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Date</div>
            <div className="text-lg font-semibold">
              {formatDate(expense.date)}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-600">Description</div>
            <div className="text-gray-800 mt-1">
              {expense.description || "No description provided"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => navigate(`/expenses/edit/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={deleteMutation.isPending}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
