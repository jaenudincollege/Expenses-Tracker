import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { currentUser } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
          Personal Expenses Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Track your expenses and income easily!
        </p>

        <div className="mt-8">
          {currentUser ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all w-full md:w-auto"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all w-full md:w-auto"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
