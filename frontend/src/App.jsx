import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import ExpenseForm from "./pages/ExpenseForm";
import ExpenseDetail from "./pages/ExpenseDetail";
import IncomeForm from "./pages/IncomeForm";
import IncomeDetail from "./pages/IncomeDetail";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Expense Routes */}
                <Route path="/expenses/new" element={<ExpenseForm />} />
                {/* Important: More specific routes must come before dynamic ones */}
                <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
                <Route path="/expenses/:id" element={<ExpenseDetail />} />

                {/* Income Routes */}
                <Route path="/incomes/new" element={<IncomeForm />} />
                {/* Important: More specific routes must come before dynamic ones */}
                <Route path="/incomes/edit/:id" element={<IncomeForm />} />
                <Route path="/incomes/:id" element={<IncomeDetail />} />
              </Route>
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
