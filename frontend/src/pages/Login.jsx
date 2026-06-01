import { useEffect } from "react";;
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {

    const { token, role } = useAuth();
  const navigate = useNavigate();

   // 🔥 Auto redirect if already logged in
  useEffect(() => {
    if (token) {
      if (role === "HOSTEL_OWNER") {
        navigate("/hostel_owner/dashboard", { replace: true });
      } 
      else if (role === "USER") {
        navigate("/user/dashboard", { replace: true });
      }
    }
  }, [token, role, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Login />
      </div>
    </div>
  );
}
