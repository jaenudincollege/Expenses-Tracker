import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/DashboardNew";
import Analytics from "./pages/Analytics";
import ExpensesPage from "./pages/ExpensesPage";
import ExpenseForm from "./pages/ExpenseForm";
import ExpenseDetail from "./pages/ExpenseDetail";
import IncomesPage from "./pages/IncomesPage";
import IncomeForm from "./pages/IncomeForm";
import IncomeDetail from "./pages/IncomeDetail";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            {/* Public routes with navbar */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <main>
                    <Home />
                  </main>
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Navbar />
                  <main>
                    <Login />
                  </main>
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Navbar />
                  <main>
                    <Register />
                  </main>
                </>
              }
            />

            {/* Protected routes with dashboard layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analytics" element={<Analytics />} />

                {/* Expenses Routes */}
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/expenses/new" element={<ExpenseForm />} />
                <Route path="/expenses/edit/:id" element={<ExpenseForm />} />
                <Route path="/expenses/:id" element={<ExpenseDetail />} />

                {/* Incomes Routes */}
                <Route path="/incomes" element={<IncomesPage />} />
                <Route path="/incomes/new" element={<IncomeForm />} />
                <Route path="/incomes/edit/:id" element={<IncomeForm />} />
                <Route path="/incomes/:id" element={<IncomeDetail />} />
              </Route>
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
