import React, { useEffect, useState } from 'react';
import { getUserRole } from '../utils/auth';
import { ROLES } from '../constants/roles';
import { useNavigate ,useParams } from 'react-router-dom';


const Dashboard = () => {
  const userRole = getUserRole();
  const { role } = useParams();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const res = await fetch(`${BASE}/dashboard/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {dashboardData?.message || 'Dashboard'}
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          {userRole === ROLES.ADMIN && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-purple-600">Admin Panel</h2>
              <p>You have full access to manage users and hostels.</p>

              {/* 🔗 Navigate to Manage Users Page */}
              <button
                onClick={() => navigate('/admin/users')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Manage Users
              </button>

              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-4">
                Manage All Hostels
              </button>
            </div>
          )}

          {userRole === ROLES.HOSTEL_OWNER && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-green-600">Hostel Owner Panel</h2>
              <p>You can manage your hostels and view bookings.</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                My Hostels
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 ml-4">
                View Bookings
              </button>
            </div>
          )}

          {userRole === ROLES.USER && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-blue-600">User Panel</h2>
              <p>You can browse and book hostels.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Browse Hostels
              </button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 ml-4">
                My Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
