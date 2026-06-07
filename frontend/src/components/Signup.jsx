// src/components/Signup.jsx
import { useState } from "react";
import { toast } from "react-toastify";

import { useNavigate, Link } from "react-router-dom";
import { userFields, hostelOwnerFields } from "../constants/formFields";
import FormAction from "./FormAction";
import FormExtra from "./FormExtra";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const initializeFieldsState = (fieldsArray) => {
  const state = {};
  fieldsArray.forEach((field) => {
    state[field.id] = "";
  });
  return state;
};

export default function Signup({
  forceRole = null,
  onSubmitOverride = null,
  hideTabs = false
}) {
  const [activeTab, setActiveTab] = useState(forceRole || "user");
  const [userState, setUserState] = useState(initializeFieldsState(userFields));
  const [hostelOwnerState, setHostelOwnerState] = useState(initializeFieldsState(hostelOwnerFields));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");



  const navigate = useNavigate();

  // Determine current fields and state based on active tab and forceRole
  const getCurrentConfig = () => {
    if (forceRole === "admin") {
      // Admin ke liye sirf signup form, login nahi
      return {
        fields: userFields, // Use userFields for admin registration
        state: userState,
        isLogin: false
      };
    }

    return {
      fields: activeTab === "user" ? userFields : hostelOwnerFields,
      state: activeTab === "user" ? userState : hostelOwnerState,
      isLogin: false
    };
  };

  const { fields: currentFields, state: currentState, isLogin } = getCurrentConfig();
  // 👉 Name Validation Function
  const validateName = (name) => {
    if (!name || !name.trim()) {
      return "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      return "Name must contain only letters and spaces";
    } else if (name.length < 2 || name.length > 30) {
      return "Name must be between 2 and 30 characters";
    }
    return "";
  };
  // 👉 Email Validation Function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      return "Email is required";
    } else if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };
  const handleChange = (e) => {
    const { id, value } = e.target;

    if (forceRole === "admin") {
      setUserState({ ...userState, [id]: value });
    } else if (activeTab === "user") {
      setUserState({ ...userState, [id]: value });
    } else {
      setHostelOwnerState({ ...hostelOwnerState, [id]: value });
    }


    if (id === "name") {
      const errorMsg = validateName(value);
      setNameError(errorMsg);
    }

 if (id === "email") {
    const errorMsg = validateEmail(value);
    setEmailError(errorMsg);
  }

    // 👉 Check password strength live
    if (id === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength("");
      setPasswordError("");
      return;
    }

    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const mediumRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

    if (strongRegex.test(password)) {
      setPasswordStrength("strong");
      setPasswordError("");
    } else if (mediumRegex.test(password)) {
      setPasswordStrength("medium");
      setPasswordError(
        "Password should include a mix of uppercase, lowercase, and numbers."
      );
    } else {
      setPasswordStrength("weak");
      setPasswordError(
        "Password must be 8+ chars and include uppercase, lowercase, number & special char."
      );
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

   const handleSubmit = async (e) => {
  e.preventDefault();

  const name = currentState.name?.trim();
  const email = currentState.email?.trim();

  // 🔹 Name validation
  if (!name) {
    alert("Name is required");
    return;
  } else if (!/^[A-Za-z\s]+$/.test(name)) {
    alert("Name must contain only letters and spaces");
    return;
  } else if (name.length < 2 || name.length > 30) {
    alert("Name must be between 2 and 30 characters");
    return;
  }

  // 🔹 Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    alert("Email is required");
    return;
  } else if (!emailRegex.test(email)) {
    alert("Please enter a valid email address");
    return;
  }

  setIsLoading(true);
  await handleSignup();
};



    setIsLoading(true);
    await handleSignup();
  };

  const handleSignup = async () => {
    const userRole = forceRole || (activeTab === "user" ? "user" : "hostel_owner");

    if (onSubmitOverride) {
      onSubmitOverride({ ...currentState, role: userRole });
    } else {
      await createAccount(userRole);
    }
  };

  const createAccount = async (role) => {
    const formData = { ...currentState, role };

    console.log("Signup Form Data:", formData);

    try {
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
         toast.success("Registeration successful");

        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        if (forceRole === "admin") {
          navigate("/admin-login");
        } else {
          navigate("/login");
        }
      } else {
        const errorData = await res.json();
        toast.error(`Registration failed: ${errorData.message || "Please try again."}`);
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong while connecting to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return "Creating Account...";
    }

    if (forceRole === "admin") {
      return "Register as Admin";
    }

    return `Register as ${activeTab === "user" ? "User" : "Hostel Owner"}`;
  };

  const getTitle = () => {
    if (forceRole === "admin") {
      return "Admin Portal";
    }
    return "Create Account";
  };

  const getTabsConfig = () => {
    if (forceRole === "admin") {
      return [
        { id: "login", label: "Login" },
        { id: "register", label: "Register" }
      ];
    }

    return [
      { id: "user", label: "User" },
      { id: "hostelOwner", label: "Hostel Owner" }
    ];
  };

  // Handle tab click - agar admin login tab par click kare toh login page redirect
  const handleTabClick = (tabId) => {
    if (forceRole === "admin" && tabId === "login") {
      navigate("/admin-login");
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white p-5 md:p-8 rounded-lg shadow-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h2>

            {/* Regular users ke liye subtitle */}
            {!forceRole && (
              <p className="text-sm text-gray-600 mb-6">
                Register as a User or Hostel Owner
              </p>
            )}
          </div>

          <form className="mt-2 space-y-6" onSubmit={handleSubmit}>
            {/* Admin Header with Login/Register tabs - User/Hostel Owner jaisa design */}
            {forceRole === "admin" && (
              <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
                {getTabsConfig().map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Show regular tabs only for non-admin */}
            {!forceRole && !hideTabs && (
              <div className="flex mb-6 rounded-lg bg-gray-100 p-1">
                {getTabsConfig().map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                        ? "bg-white text-purple-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {currentFields.map((field) => (
                <div key={field.id} className="relative">
                  <label
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label}
                  </label>

                  <div className="relative">
                    <input
                      id={field.id}
                      name={field.name || field.id}
                      type={
                        field.type === "password"
                          ? showPassword
                            ? "text"
                            : "password"
                          : field.type
                      }
                      value={currentState[field.id]}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={`appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm ${forceRole === "admin" ? 'rounded-lg py-3' : 'rounded-md py-2'
                        }`}
                    />
                    {field.id === "name" && nameError && (
                      <p className="text-red-500 text-xs mt-1">{nameError}</p>
                    )}
                    {field.id === "email" && emailError && (
                      <p className="text-red-500 text-xs mt-1">{emailError}</p>
                    )}



                    {field.type === "password" && (
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 cursor-pointer text-gray-500 ${forceRole === "admin" ? 'top-3' : 'top-2'
                          }`}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </span>

                    )}
                    {/* Password Strength Indicator */}
                    {field.id === "password" && passwordStrength && (
                      <>
                        <p
                          className={`text-sm mt-1 ${passwordStrength === "weak"
                              ? "text-red-500"
                              : passwordStrength === "medium"
                                ? "text-yellow-500"
                                : "text-green-600"
                            }`}
                        >
                          {passwordStrength === "weak"
                            ? "Weak 😣"
                            : passwordStrength === "medium"
                              ? "Medium 😐"
                              : "Strong 💪"}
                        </p>

                        <div className="h-1 mt-1 w-full bg-gray-200 rounded">
                          <div
                            className={`h-1 rounded transition-all duration-300 ${passwordStrength === "weak"
                                ? "bg-red-500 w-1/3"
                                : passwordStrength === "medium"
                                  ? "bg-yellow-500 w-2/3"
                                  : "bg-green-500 w-full"
                              }`}
                          ></div>
                        </div>

                        {passwordError && (
                          <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                        )}
                      </>
                    )}

                  </div>
                </div>
              ))}
            </div>

            <FormAction
              handleSubmit={handleSubmit}
              text={getButtonText()}
              disabled={isLoading}
            />

            {/* Show appropriate links */}
            {!forceRole && (
              <FormExtra
                link="/login"
                linkText="Login here"
                text="Already have an account?"
              />
            )}

            {forceRole === "admin" && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Regular users should use{" "}
                  <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
                    public portal
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}