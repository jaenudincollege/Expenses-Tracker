import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomeService } from "../services/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import { processApiError } from "../utils/errorHandler";

const IncomeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: income,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ["income", id],
    queryFn: async () => {
      const response = await incomeService.getById(id);
      return response.data?.income || response.data;
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: incomeService.delete,
    onSuccess: () => {
      toast.success("Income deleted successfully!");
      queryClient.invalidateQueries(["incomes"]);
      queryClient.invalidateQueries(["dashboardData"]);
      navigate("/incomes");
    },
    onError: (err) => {
      const errorResult = processApiError(err, {
        defaultMessage: "Failed to delete income",
      });
      toast.error(errorResult.message);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" message="Loading income details..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error Loading Income</p>
          <p>
            {queryError?.response?.data?.message ||
              queryError?.message ||
              "Failed to load income details."}
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

  if (!income) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-md">
          <p className="font-bold">Not Found</p>
          <p>The income record you're looking for could not be found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-green-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Income Detail</h2>
        </div>
        <div className="p-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Title</div>
            <div className="text-lg font-semibold">{income.title}</div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Amount</div>
            <div className="text-lg font-semibold text-green-600">
              +${parseFloat(income.amount).toFixed(2)}
            </div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Category</div>
            <div className="text-lg font-semibold">
              <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                {income.category}
              </span>
            </div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="text-sm text-gray-600">Date</div>
            <div className="text-lg font-semibold">
              {new Date(income.date).toLocaleDateString()}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-600">Description</div>
            <div className="text-gray-800 mt-1">
              {income.description || "No description provided"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <button
              onClick={() => navigate(`/incomes/edit/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
              disabled={deleteMutation.isPending}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm sm:text-base disabled:opacity-50"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm sm:text-base"
              disabled={deleteMutation.isPending}
            >
              Back
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm sm:text-base"
              disabled={deleteMutation.isPending}
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetail;
