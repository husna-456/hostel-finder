// src/components/PasswordSuccess.jsx
import { useNavigate } from "react-router-dom";

export default function PasswordSuccess() {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-center">
      <img
        src="https://thumbs.dreamstime.com/b/hostel-icon-vector-filled-flat-sign-solid-pictogram-isolated-white-symbol-logo-illustration-pixel-perfect-graphics-98922281.jpg"
        alt="Logo"
        className="w-16 h-16 mb-4"
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Password changed successfully
      </h2>
      <button
        onClick={handleLoginRedirect}
        className="bg-black text-white font-medium py-2 px-6 rounded-full mt-4 hover:bg-gray-800 transition"
      >
        Log in
      </button>

      <div className="mt-8 text-sm text-gray-500">
        <a href="/terms" className="mr-3 hover:underline">
          Terms of Use
        </a>
        <a href="/privacy" className="hover:underline">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}