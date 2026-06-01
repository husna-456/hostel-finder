import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { getRoomsByHostel } from "../../api/room.api";

export default function BookHostel() {
  const { id: hostelId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    contactNo: "",
    email: "",
    location: "",
    category: "",
    people: "",
    message: "",
  });

  const [userId, setUserId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserId(parsed._id || parsed.id);
    }

    if (hostelId) {
      getRoomsByHostel(hostelId)
        .then((data) => setRooms(data))
        .catch(() => {});
    }
  }, [hostelId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "roomType") {
      setSelectedRoom(value);
      const room = rooms.find((r) => r.roomId === value);
      setAdvanceAmount(room?.advanceAmount || 0);
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hostelId) {
      toast.error("Please select a hostel first.");
      return;
    }

    if (!selectedRoom) {
      toast.error("Please select a room type.");
      return;
    }

    const userData = localStorage.getItem("user");
    if (!userData) {
      toast.error("Please login first.");
      return;
    }
    const parsedUser = JSON.parse(userData);
    const currentUserId = parsedUser._id || parsedUser.id;

    if (!currentUserId) {
      toast.error("User not found. Please login again.");
      return;
    }

    if (!form.name || !form.contactNo || !form.email || !form.location || !form.category || !form.people) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!/^\d{11}$/.test(form.contactNo)) {
      toast.error("Contact number must be exactly 11 digits.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${BASE}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          hostelId,
          userId: currentUserId,
          roomId: selectedRoom,
          advanceAmount,
          ...form,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const bookingId = data._id || data.booking?._id;
        setSuccessMsg("Booking successful! Redirecting to payment...");
        setForm({
          name: "", contactNo: "", email: "", location: "", category: "", people: "", message: ""
        });
        setSelectedRoom("");
        setAdvanceAmount(0);

        setTimeout(() => {
          if (bookingId) {
            navigate(`/user/payment/${bookingId}`);
          }
        }, 1500);
      } else {
        toast.error(data.message || "Booking failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRooms = rooms.filter((r) => {
    const total = r.totalSeats || 999;
    const reserved = r.reservedSeats || 0;
    return reserved < total;
  });

  const selectedRoomData = rooms.find((r) => r.roomId === selectedRoom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2 md:mb-3">Book Hostel</h2>
          <p className="text-gray-600 text-base md:text-lg">Fill in your details to confirm your stay</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-8 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* No Hostel Selected Alert */}
        {!hostelId && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3">
           <AlertTriangle className="w-7 h-7 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-lg">Hostel Not Selected</p>
              <p className="text-orange-700">Please go back and select a hostel first.</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 md:px-8 py-4 md:py-5">
            <h3 className="text-xl font-bold">Your Booking Details</h3>
          </div>

          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 md:space-y-6">

            {/* Room Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type *</label>
              <select
                name="roomType"
                value={selectedRoom}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition text-gray-700"
                required
              >
                <option value="" disabled>Select a room</option>
                {availableRooms.map((room) => {
                  const reserved = room.reservedSeats || 0;
                  const total = room.totalSeats;
                  const seatsLeft = total ? total - reserved : "?";
                  return (
                    <option key={room.roomId} value={room.roomId}>
                      {room.title || room.type} — PKR {room.seatPrice?.toLocaleString()}/mo
                      {total ? ` (${seatsLeft} seats left)` : ""}
                    </option>
                  );
                })}
              </select>
              {rooms.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Loading room options...</p>
              )}
              {rooms.length > 0 && availableRooms.length === 0 && (
                <p className="text-xs text-red-500 mt-1">All rooms are currently full.</p>
              )}
            </div>

            {/* Advance Amount Display */}
            {selectedRoom && advanceAmount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 font-medium">Advance Required</p>
                  <p className="text-xs text-amber-500">This amount must be paid to confirm your booking</p>
                </div>
                <span className="text-xl font-bold text-amber-800">PKR {advanceAmount.toLocaleString()}</span>
              </div>
            )}

            {selectedRoom && selectedRoomData?.reservedSeats !== undefined && selectedRoomData?.totalSeats && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Room Availability</span>
                  <span>{selectedRoomData.reservedSeats}/{selectedRoomData.totalSeats}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (selectedRoomData.reservedSeats / selectedRoomData.totalSeats) * 100)}%`,
                      backgroundColor:
                        selectedRoomData.reservedSeats / selectedRoomData.totalSeats >= 1
                          ? "#ef4444"
                          : selectedRoomData.reservedSeats / selectedRoomData.totalSeats > 0.8
                          ? "#f97316"
                          : "#8b5cf6",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                <input
                  name="name"
                  placeholder="Ahmad Khan"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact No (11 digits) *</label>
                <input
                  name="contactNo"
                  placeholder="03XXXXXXXXX"
                  value={form.contactNo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                  maxLength={11}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Where are you from? *</label>
              <input
                name="location"
                placeholder="e.g. Lahore, Karachi, Islamabad"
                value={form.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition text-gray-700"
                  required
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Student">Student</option>
                  <option value="Job Holder">Job Holder</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">How many people? *</label>
                <input
                  name="people"
                  type="number"
                  placeholder="1"
                  value={form.people}
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Any message (optional)</label>
              <textarea
                name="message"
                placeholder="Let the owner know about your arrival time or special requests..."
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 outline-none transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !hostelId}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                isSubmitting || !hostelId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-2xl transform hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>Book Now</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          After booking, you will be redirected to the payment page to confirm your reservation.
        </p>
      </div>
    </div>
  );
}
