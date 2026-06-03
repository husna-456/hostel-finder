import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaCalendarCheck, FaCreditCard } from "react-icons/fa";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const type = params.get("type"); // "card" | "manual" (default)

  const isCard = type === "card";

  const heading = isCard
    ? "Payment Received!"
    : "Payment Submitted Successfully!";

  const message = isCard
    ? "Your card payment has been received. The owner will confirm your seat shortly."
    : "Your payment receipt is under review. The owner will verify within 24 hours.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8 md:p-10 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 14 }}
          className="flex justify-center mb-6"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
        </motion.div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
          {heading}
        </h1>

        {/* Message */}
        <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate("/user/my-bookings")}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <FaCalendarCheck />
            View My Bookings
          </button>
          <button
            onClick={() => navigate("/user/payments")}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-white border border-purple-200 hover:border-purple-400 text-purple-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <FaCreditCard />
            View My Payments
          </button>
        </div>
      </motion.div>
    </div>
  );
}
