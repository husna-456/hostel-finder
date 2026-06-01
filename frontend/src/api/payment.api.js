import { fetchClient } from "./fetchClient";

export const createPaymentIntent = ({ amount, currency, bookingId }) =>
  fetchClient("/payments/create-payment-intent", {
    method: "POST",
    body: JSON.stringify({ amount, currency, bookingId }),
  });

export const confirmBooking = ({ bookingId, paymentIntentId }) =>
  fetchClient("/payments/confirm-booking", {
    method: "POST",
    body: JSON.stringify({ bookingId, paymentIntentId }),
  });

export const submitManualPayment = (bookingId, method, receiptUrl, transactionRef) =>
  fetchClient("/payments/manual", {
    method: "POST",
    body: JSON.stringify({ bookingId, method, receiptScreenshot: receiptUrl, transactionRef }),
  });

export const getPaymentByBooking = (bookingId) =>
  fetchClient(`/payments/booking/${bookingId}`);

export const verifyPayment = (paymentId) =>
  fetchClient(`/payments/${paymentId}/verify`, {
    method: "PATCH",
  });

export const rejectPayment = (paymentId, reason) =>
  fetchClient(`/payments/${paymentId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });

export const getPendingManualPayments = () =>
  fetchClient("/payments/pending-manual");

export const getMyPayments = () =>
  fetchClient("/payment/my-payments");
