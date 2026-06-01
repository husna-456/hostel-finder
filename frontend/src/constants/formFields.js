// src/constants/formFields.js

// Common fields for all roles
const commonFields = [
  {
    id: "name",
    label: "Name",
    placeholder: "Enter your name",
    type: "text",
    required: true,
  },
  {
    id: "email",
    label: "Email",
    placeholder: "Enter your Email",
    type: "email",
    required: true,
  },
  {
    id: "password",
    label: "Password",
    placeholder: "Create a strong password",
    type: "password",
    required: true,
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Re-enter your password",
    type: "password",
    required: true,
  },
];

// User-specific fields
const userFields = [
  ...commonFields
];


// Hostel owner-specific fields
const hostelOwnerFields = [
  ...commonFields
];

// Admin-specific fields (for private admin route)
const adminFields = [
  ...commonFields,
  {
    id: "adminCode",
    label: "Admin Access Code",
    placeholder: "Enter admin access code",
    type: "password",
    required: true,
  }
];

// Login fields
const loginFields = [
  {
    id: "email",
    label: "Email address",
    placeholder: "Enter your email",
    type: "email",
    required: true,
  },
  {
    id: "password",
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    required: true,
  }
];

export {  
  userFields, 
  hostelOwnerFields, 
  adminFields, 
  loginFields,
  commonFields 
};