// src/pages/AdminLogin.jsx
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ ADDED
import { loginFields } from "../constants/formFields";
import FormAction from "../components/FormAction";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const fields = loginFields;
let fieldsState = {};
fields.forEach((field) => (fieldsState[field.id] = ""));

export default function AdminLogin() {
  const [loginState, setLoginState] = useState(fieldsState);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ ADDED

  const handleChange = (e) => {
    setLoginState({ ...loginState, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await authenticateAdmin();
  };

  const authenticateAdmin = async () => {
    const loginData = { ...loginState, role: "admin" };

    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (res.ok) {
        const data = await res.json();

        toast.success("Admin login successful!");

        // ✅ MOST IMPORTANT FIX
        login(data.token, data.role);

        // ✅ Redirect
        navigate(`/${data.role}/dashboard`);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <ToastContainer /> {/* ✅ ensure toast works */}

      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-sm text-gray-500 mt-1">Secure admin access portal</p>

          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 flex items-center justify-center">
              🔒 Authorized personnel only
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field) => (
            <div key={field.id} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.labelText}
              </label>

              <div className="relative">
                <input
                  id={field.id}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 outline-none"
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

          <FormAction
            handleSubmit={handleSubmit}
            text={isLoading ? "Logging in..." : "Login"}
          />
        </form>
      </div>
    </div>
  );
} 