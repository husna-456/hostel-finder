// src/App.jsx
import "./index.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "./context/AuthContext";

// ✅ Components
import Navbar from "./components/Navbar";
import PasswordSuccess from "./components/PasswordSucces";

// ✅ Constants
import { ROLES } from "./constants/roles";

// ✅ Public Pages
import Home from "./pages/Home";
import SignupPage from "./pages/Signup";
import LoginPage from "./pages/Login";
import ForgetPage from "./pages/ForgetPage";
import PasswordPage from "./pages/PasswordPage";
import ResultsPage from "./pages/result";
import Unauthorized from "./pages/Unauthorized";

// ✅ Admin Pages
import AdminSignup from "./pages/AdminSignup";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import OwnerManagement from "./pages/admin/OwnerManagement";
import HostelManagement from "./pages/admin/HostelManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import ChatMonitoring from "./pages/admin/ChatMonitoring";
import SettingsPage from "./pages/admin/SettingsPage";
import SiteContentPage from "./pages/admin/SiteContentPage";

// ✅ Owner Pages
import OwnerLayout from "./pages/OwnerLayout";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerAddHostel from "./pages/OwnerAddHostel";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerHostelListing from "./pages/OwnerHostelListing";
import GeneralDetails from "./pages/PostHostel/GeneralDetails";
import Specifications from "./pages/PostHostel/Specifications";
import Facilities from "./pages/PostHostel/Facilities";
import OwnerChat from "./pages/OwnerChat";

// ✅ User Pages
import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserHostelListing from "./pages/user/UserHostelListing";
import BookHostel from "./pages/user/BookHostel";
import MyBookings from "./pages/user/MyBookings";
import MessagesPage from "./pages/user/MessagesPage";
import PaymentPage from "./pages/user/PaymentPage";
import PaymentsPage from "./pages/user/PaymentsPage";
import PaymentSuccessPage from "./pages/user/PaymentSuccessPage";

// ✅ Shared
import ProfilePage from "./pages/ProfilePage";

// ✅ Call system
import { CallProvider } from "./context/CallContext";
import IncomingCallOverlay from "./components/chat/IncomingCallOverlay";
import ActiveCallScreen from "./components/chat/ActiveCallScreen";

// ✅ Public Hostel Pages
import AllHostels from "./pages/AllHostels";
import HostelDetails from "./pages/HostelDetails";
import AdvancedSearch from "./pages/AdvancedSearch";
import FAQs from "./components/FAQ";
import ContactUs from "./components/Contactus";
import Facts from "./pages/Facts";


// ✅ PrivateRoute Component
const PrivateRoute = ({ children, allowedRoles }) => {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

function App() {
  const location = useLocation();
  const { loading, isAuthenticated, role } = useAuth();

  const hideNavbar =
    location.pathname.startsWith("/hostel_owner") ||
    location.pathname.startsWith("/user") ||
    location.pathname.startsWith("/admin");

  return (
    <CallProvider>
      {!hideNavbar && <Navbar />}

      <div className="min-h-screen bg-gray-50">
        <Routes>
           {/* 🌐 Public Routes */}
          <Route
            path="/"
            element={role === ROLES.HOSTEL_OWNER ? <Navigate to="/hostel_owner/dashboard" replace /> : <Home />}
          />

          <Route
            path="/login"
            element={
              isAuthenticated
                ? role === ROLES.USER
                  ? <Navigate to="/user/dashboard" replace />
                  : <Navigate to="/hostel_owner/dashboard" replace />
                : <LoginPage />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated
                ? role === ROLES.USER
                  ? <Navigate to="/user/dashboard" replace />
                  : <Navigate to="/hostel_owner/dashboard" replace />
                : <SignupPage />
            }
          />

          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-signup" element={<AdminSignup />} />

          <Route path="/password-reset" element={<PasswordPage />} />
          <Route path="/forget-password/:id/:token" element={<ForgetPage />} />
          <Route path="/password-success" element={<PasswordSuccess />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* 🌟 Public Hostel Pages */}
          <Route path="/all-hostels" element={<AllHostels />} />
          <Route path="/FAQs" element={<FAQs />} />
          <Route path="/Contact" element={<ContactUs />} />
          <Route path="/hostels/:id" element={<HostelDetails />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/advanced-search" element={<AdvancedSearch />} />
          <Route path="/facts" element={<Facts />} />
          <Route path="/book-hostel" element={<BookHostel />} />
          <Route path="/book-hostel/:id" element={<BookHostel />} />

          {/* 🏢 Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="owners" element={<OwnerManagement />} />
            <Route path="hostels" element={<HostelManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="chats" element={<ChatMonitoring />} />
            <Route path="settings"      element={<SettingsPage />}     />
            <Route path="site-content" element={<SiteContentPage />} />
            <Route path="profile"      element={<ProfilePage />}     />
          </Route>

          {/* 🏠 Owner Routes */}
          <Route
            path="/hostel_owner/*"
            element={
              loading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
              ) : !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : role !== ROLES.HOSTEL_OWNER ? (
                <Navigate to="/unauthorized" replace />
              ) : (
                <OwnerLayout />
              )
            }
          >
            <Route index element={<OwnerDashboard />} />
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="add-hostel" element={<OwnerAddHostel />} />
            <Route path="add-hostel/general-details" element={<GeneralDetails />} />
            <Route path="add-hostel/specifications" element={<Specifications />} />
            <Route path="add-hostel/facilities" element={<Facilities />} />
            <Route path="bookings" element={<OwnerBookings />} />
            <Route path="hostels" element={<OwnerHostelListing />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="chat" element={<OwnerChat />} />
          </Route>

          {/* 👤 User Routes */}
          <Route
            path="/user/*"
            element={
              loading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
              ) : !isAuthenticated ? (
                <Navigate to="/login" replace />
              ) : role !== ROLES.USER ? (
                <Navigate to="/unauthorized" replace />
              ) : (
                <UserLayout />
              )
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="hostel-listing" element={<UserHostelListing userPanel={true} />} />
            <Route path="hostel-listing/:id" element={<HostelDetails userPanel={true} />} />
            <Route path="book-hostel/:id" element={<BookHostel />} />
            <Route path="book-hostel" element={<BookHostel />} />
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="payment/:bookingId" element={<PaymentPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 💬 User Chat — standalone full-screen (no sidebar/layout) */}
          <Route
            path="/user/chat"
            element={
              <PrivateRoute allowedRoles={[ROLES.USER]}>
                <MessagesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/messages/:hostelId/:ownerId"
            element={
              <PrivateRoute allowedRoles={[ROLES.USER]}>
                <MessagesPage />
              </PrivateRoute>
            }
          />

          {/* 🚫 Fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </div>

      <IncomingCallOverlay />
      <ActiveCallScreen />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
      />
    </CallProvider>
  );
}

export default App;
