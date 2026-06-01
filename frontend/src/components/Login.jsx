import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginFields } from "../constants/formFields";
import FormAction from "../components/FormAction";
import FormExtra from "../components/FormExtra";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Tabs from "../components/Tabs";
import { useAuth } from "../context/AuthContext";

const fields = loginFields;
let fieldsState = {};
fields.forEach((field) => (fieldsState[field.id] = ""));

export default function Login() {
  const [loginState, setLoginState] = useState(fieldsState);
  const [activeTab, setActiveTab] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();



  // Get redirect path if coming from Book Now
  const redirectTo = location.state?.redirectTo;

  // handle input
  const handleChange = (e) => {
    setLoginState({ ...loginState, [e.target.id]: e.target.value });
  };

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await authenticateUser();
  };

  // send login request
  const authenticateUser = async () => {
    const loginData = {
      ...loginState,
      role: activeTab === "user" ? "user" : "hostel_owner",
    };
    console.log("Login data sending to backend:", loginData);

    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success("Login successful!");

        login(data.token, data.role);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.role);



        // ✅ Redirect to intended page or default dashboard
        navigate(redirectTo || `/${data.role}/dashboard`);
      } else {
        const errorData = await res.json();
        toast.error(`Login failed: ${errorData.message || "Invalid credentials."}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Server connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-20 left-0 right-0 bottom-0 flex items-start justify-center bg-gray-50 py-12 px-4 overflow-y-auto z-40">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign In to Account
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Welcome back! Please login to continue.
            </p>
          </div>

          {/* Tabs for user / hostel owner */}
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} context="login" />

          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {fields.map((field) => (
              <div key={field.id} className="relative">
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.labelText}
                </label>
                <div className="relative">
                  <input
                    id={field.id}
                    name={field.name}
                    type={
                      field.type === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : field.type
                    }
                    value={loginState[field.id]}
                    onChange={handleChange}
                    required={field.isRequired}
                    placeholder={field.placeholder}
                    className="appearance-none rounded-md w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 sm:text-sm"
                  />
                  {field.type === "password" && (
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 cursor-pointer text-gray-500"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <FormExtra type="login" />

            <FormAction handleSubmit={handleSubmit} text={isLoading ? "Signing in..." : "Sign In"} />

            <div className="text-sm text-center">
              <span className="text-gray-600">Don’t have an account? </span>
              <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
                Sign up here
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Admin?{" "}
                <Link to="/admin-login" className="font-medium text-purple-600 hover:text-purple-500">
                  Access admin portal
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

