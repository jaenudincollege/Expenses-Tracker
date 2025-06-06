import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// Expense services
export const expenseService = {
  getAll: () => api.get("/expenses"),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (expense) => api.post("/expenses", expense),
  update: (id, expense) => api.patch(`/expenses/${id}`, expense),
  delete: (id) => api.delete(`/expenses/${id}`),
  getHistory: (days) => api.get(`/expenses/history/${days}`),
  downloadCSV: async () => {
    const response = await api.get("/expenses/download/csv", {
      responseType: "blob",
    });
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `expenses_${new Date().toISOString().split("T")[0]}.csv`
    );
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    link.parentNode.removeChild(link);
    return response;
  },
};

// Income services
export const incomeService = {
  getAll: () => api.get("/incomes"),
  getById: (id) => api.get(`/incomes/${id}`),
  create: (income) => api.post("/incomes", income),
  update: (id, income) => api.patch(`/incomes/${id}`, income),
  delete: (id) => api.delete(`/incomes/${id}`),
  getHistory: (days) => api.get(`/incomes/history/${days}`),
  downloadCSV: async () => {
    const response = await api.get("/incomes/download/csv", {
      responseType: "blob",
    });
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `incomes_${new Date().toISOString().split("T")[0]}.csv`
    );
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    link.parentNode.removeChild(link);
    return response;
  },
};

// Transaction services
export const transactionService = {
  getAll: () => api.get("/transactions"),
  getHistory: (days) => api.get(`/transactions/history/${days}`),
  downloadCSV: async () => {
    const response = await api.get("/transactions/download/csv", {
      responseType: "blob",
    });
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `transactions_${new Date().toISOString().split("T")[0]}.csv`
    );
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    link.parentNode.removeChild(link);
    return response;
  },
};

export default api;
