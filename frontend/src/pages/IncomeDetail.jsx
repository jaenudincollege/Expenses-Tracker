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

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!income) return <div>Income not found</div>;

  return (
    <div className="detail-container">
      <h2>Income Detail</h2>
      <div className="detail-card">
        <div className="detail-row">
          <strong>Title:</strong>
          <span>{income.title}</span>
        </div>
        <div className="detail-row">
          <strong>Amount:</strong>
          <span>${income.amount}</span>
        </div>
        <div className="detail-row">
          <strong>Category:</strong>
          <span>{income.category}</span>
        </div>
        <div className="detail-row">
          <strong>Date:</strong>
          <span>{new Date(income.date).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <strong>Description:</strong>
          <span>{income.description || "No description provided"}</span>
        </div>

        <div className="detail-actions">
          <button onClick={() => navigate(`/incomes/edit/${id}`)}>Edit</button>
          <button onClick={handleDelete} className="delete-btn">
            Delete
          </button>
          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetail;
