// src/pages/AdminSignup.jsx
import React from "react";
import SignupComponent from "../components/Signup";

export default function AdminSignup() {
  return (
    <SignupComponent 
      forceRole="admin"
      hideTabs={true}
    />
  );
}