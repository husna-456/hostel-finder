// src/components/ProfileDropdown.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";

export default function ProfileDropdown({ userType }) {
  const navigate = useNavigate();
  const [image, setImage] = useState("/default-profile.png");
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("User Name");

  useEffect(() => {
    const storedImage = localStorage.getItem(`${userType}Image`);
    const storedName = localStorage.getItem(`${userType}Name`);
    if (storedImage) setImage(storedImage);
    if (storedName) setUsername(storedName);
  }, [userType]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        localStorage.setItem(`${userType}Image`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
        <img src={image} alt="profile" className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-black text-white rounded-lg shadow-lg z-50 p-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img src={image} alt="profile" className="w-20 h-20 rounded-full object-cover border-2 border-gray-400" />
              <label htmlFor={`profile-upload-${userType}`} className="absolute bottom-0 right-0 bg-purple-600 p-1 rounded-full cursor-pointer hover:bg-purple-500">
                <FaPen className="text-white text-sm" />
              </label>
              <input type="file" id={`profile-upload-${userType}`} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
            <h3 className="font-semibold text-lg">{username}</h3>
            <button onClick={() => navigate(userType === "user" ? "/user/profile" : "/hostel_owner/profile")} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded mt-2 w-full">
              Edit Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



