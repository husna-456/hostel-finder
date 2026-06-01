import { Link, useLocation } from "react-router-dom";

export default function FormExtra() {
  const location = useLocation();

  // If current path is "/login" => show Remember me + Forgot password
  // If current path is "/signup" => show "Already have an account?"
  const isLoginPage =  location.pathname==="/login" || location.pathname==="/";

  return (
    <>
      {isLoginPage ? (
        // 🔹 This part shows on Login Page
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Remember me
            </label>
          </div>

          {/* 🔹 Corrected React Router Link */}
          <div className="text-sm">
            <Link
              to="/password-reset"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      ) : (
        // 🔹 This part shows on Signup Page
        <p className="text-center text-sm text-gray-600 mt-2">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>
      )}
    </>
  );
}
