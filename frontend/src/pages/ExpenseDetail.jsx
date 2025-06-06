import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { expenseService } from "../services/api";

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const response = await expenseService.getById(id);
        // Handle nested data structure - direct access or through expense property
        setExpense(response.data?.expense || response.data);
      } catch (err) {
        setError("Failed to load expense details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await expenseService.delete(id);
        navigate("/dashboard");
      } catch (err) {
        setError("Failed to delete expense");
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!expense) return <div>Expense not found</div>;

  return (
    <div className="detail-container">
      <h2>Expense Detail</h2>
      <div className="detail-card">
        <div className="detail-row">
          <strong>Title:</strong>
          <span>{expense.title}</span>
        </div>{" "}
        <div className="detail-row">
          <strong>Amount:</strong>
          <span className="text-red-500">${Math.abs(expense.amount)}</span>
        </div>
        <div className="detail-row">
          <strong>Category:</strong>
          <span>{expense.category}</span>
        </div>
        <div className="detail-row">
          <strong>Date:</strong>
          <span>{new Date(expense.date).toLocaleDateString()}</span>
        </div>
        <div className="detail-row">
          <strong>Description:</strong>
          <span>{expense.description || "No description provided"}</span>
        </div>{" "}
        <div className="detail-actions">
          <button onClick={() => navigate(`/expenses/edit/${id}`)}>Edit</button>
          <button onClick={handleDelete} className="delete-btn">
            Delete
          </button>
          <button onClick={() => navigate(-1)}>Back</button>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
