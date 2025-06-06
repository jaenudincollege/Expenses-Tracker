import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { incomeService } from "../services/api";

const IncomeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [income, setIncome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncome = async () => {
      try {
        setLoading(true);
        const response = await incomeService.getById(id);
        // Handle nested data structure - direct access or through income property
        setIncome(response.data?.income || response.data);
      } catch (err) {
        setError("Failed to load income details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncome();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this income?")) {
      try {
        await incomeService.delete(id);
        navigate("/dashboard");
      } catch (err) {
        setError("Failed to delete income");
        console.error(err);
      }
    }
  };
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );

  if (!income)
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
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

export default IncomeDetail;
