import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaCamera, FaLock, FaUser, FaEnvelope, FaEye, FaEyeSlash, FaSave } from "react-icons/fa";
import { fetchClient } from "../api/fetchClient";
import { supabase } from "../lib/supabaseClient";

export default function ProfilePage() {
  const fileInputRef = useRef(null);

  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [saving,         setSaving]         = useState(false);
  const [uploading,      setUploading]      = useState(false);

  const [name,           setName]           = useState("");
  const [email,          setEmail]          = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [changingPw, setChangingPw] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchClient("/auth/me")
      .then(data => {
        setUser(data);
        setName(data.name           || "");
        setEmail(data.email          || "");
        setProfilePicture(data.profilePicture || "");
      })
      .catch(() => toast.error("Could not load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const ext      = file.name.split(".").pop();
      const fileName = `avatars/${Date.now()}-${Math.random()}.${ext}`;
      const { error } = await supabase.storage.from("hostel-images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("hostel-images").getPublicUrl(fileName);
      setProfilePicture(data.publicUrl);
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error("Name cannot be empty");
    try {
      setSaving(true);
      const { user: updated } = await fetchClient("/auth/update-profile", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), profilePicture }),
      });
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, name: updated.name, email: updated.email }));
      setUser(updated);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) return toast.error("All password fields are required");
    if (newPw !== confirmPw)               return toast.error("New passwords do not match");
    if (newPw.length < 6)                  return toast.error("New password must be at least 6 characters");
    try {
      setChangingPw(true);
      await fetchClient("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast.success("Password changed!");
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  const initial = name.charAt(0).toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account information</p>
        </div>

        {/* Avatar + Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Account Info</h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-purple-100">
                {profilePicture ? (
                  <img src={profilePicture} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {initial}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-md transition disabled:opacity-60"
                title="Change photo"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FaCamera className="text-xs" />
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-800">{name}</p>
              <p className="text-sm text-gray-400">{email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium capitalize">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 w-full sm:w-auto justify-center"
          >
            <FaSave />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <FaLock className="text-purple-500 text-sm" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Change Password</h2>
          </div>

          <div className="space-y-4">
            {[
              { label: "Current Password",     val: currentPw,  set: setCurrentPw,  show: showCurrent, toggle: () => setShowCurrent(p => !p) },
              { label: "New Password",          val: newPw,      set: setNewPw,      show: showNew,     toggle: () => setShowNew(p => !p) },
              { label: "Confirm New Password",  val: confirmPw,  set: setConfirmPw,  show: showConfirm, toggle: () => setShowConfirm(p => !p) },
            ].map(({ label, val, set, show, toggle }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type={show ? "text" : "password"}
                    value={val}
                    onChange={e => set(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none transition"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {show ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleChangePassword}
            disabled={changingPw}
            className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60 w-full sm:w-auto justify-center"
          >
            <FaLock />
            {changingPw ? "Changing…" : "Change Password"}
          </button>
        </motion.div>

      </div>
    </div>
  );
}
