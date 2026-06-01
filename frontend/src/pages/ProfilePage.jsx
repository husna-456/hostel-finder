// src/pages/user/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { FaPen } from "react-icons/fa";

export default function ProfilePage({ userType }) {
  const defaultImage = "/default-profile.png";

  const [username, setUsername] = useState(
    localStorage.getItem(`${userType}Name`) || (userType === "hostel_owner" ? "Owner" : "User")
  );
  const [image, setImage] = useState(
    localStorage.getItem(`${userType}Image`) || defaultImage
  );

  useEffect(() => {
    const storedName = localStorage.getItem(`${userType}Name`);
    const storedImage = localStorage.getItem(`${userType}Image`);
    setUsername(storedName || (userType === "hostel_owner" ? "Owner" : "User"));
    setImage(storedImage || defaultImage);
  }, [userType]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        localStorage.setItem(`${userType}Image`, reader.result);
        window.dispatchEvent(new Event("storage")); // Update sidebar instantly
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsernameChange = (e) => setUsername(e.target.value);

  const handleSave = () => {
    if (!username.trim()) return alert("Username cannot be empty!");
    localStorage.setItem(`${userType}Name`, username);
    localStorage.setItem(`${userType}Image`, image || defaultImage);
    window.dispatchEvent(new Event("storage")); // instant sidebar update
    alert("Profile updated successfully!");
  };

  return (
    <div className="flex flex-col items-center mt-10">
      {/* Profile Image */}
      <div className="relative w-32 h-32">
        <img
          src={image || defaultImage}
          alt="profile"
          className="w-32 h-32 rounded-full border-4 border-purple-600 object-cover"
        />

        {/* Pencil Icon Overlay */}
        <label
          htmlFor={`profile-upload-page-${userType}`}
          className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-100"
          title="Change Profile Image"
        >
          <FaPen className="text-black text-sm" />
        </label>

        <input
          type="file"
          id={`profile-upload-page-${userType}`}
          className="hidden"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>

      {/* Username input */}
      <div className="mt-6 flex flex-col items-center gap-4 w-80">
        <label className="w-full">
          <span className="block font-medium text-gray-700">Username</span>
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </label>
        <button
          onClick={handleSave}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg mt-4"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}



















