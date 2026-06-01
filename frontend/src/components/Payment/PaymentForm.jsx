import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { FaLock, FaSpinner } from "react-icons/fa";
import { createPaymentIntent, confirmBooking } from "../../api/payment.api";

const CARD_STYLE = {
  style: {
    base: {
      fontSize: "16px",
      color: "#374151",
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      "::placeholder": { color: "#9ca3af" },
    },
    invalid: { color: "#dc2626", iconColor: "#dc2626" },
  },
};

export default function PaymentForm({ bookingId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const numericAmount = Number(amount) || 0;
      // Debug: ensure correct amount is sent to backend
      console.log("[PaymentForm] creating payment intent", { bookingId, amount: numericAmount });
      const intentResult = await createPaymentIntent({ amount: numericAmount, currency: "pkr", bookingId });

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(intentResult.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (paymentError) {
        setError(paymentError.message);
      } else if (paymentIntent.status === "succeeded") {
        await confirmBooking({ bookingId, paymentIntentId: paymentIntent.id });
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="border-2 border-gray-200 rounded-xl px-4 py-3.5 transition-all duration-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200">
        <CardElement options={CARD_STYLE} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
                   bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl
                   disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            <FaLock /> Pay PKR {amount.toLocaleString()}
          </>
        )}
      </button>
    </form>
  );
}
