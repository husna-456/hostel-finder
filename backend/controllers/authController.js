// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT generate karne ka function
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "7d", // token 7 din valid rahega
    });
};

// ✅ SIGNUP
export const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword, role } = req.body;
// Name validation
if (!name || !name.trim()) {
  return res.status(400).json({ message: "Name is required" });
} else if (!/^[A-Za-z\s]+$/.test(name)) {
  return res.status(400).json({ message: "Name must contain only letters and spaces" });
} else if (name.length < 2 || name.length > 30) {
  return res.status(400).json({ message: "Name must be between 2 and 30 characters" });
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
  return res.status(400).json({ message: "Valid email is required" });
}

// 🧩 Strong password validation
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!password) {
  return res.status(400).json({ message: "Password is required" });
}

if (!strongPasswordRegex.test(password)) {
  return res.status(400).json({
    message:
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
  });
}

// 🧩 Check if passwords match
if (password !== confirmPassword) {
  return res.status(400).json({ message: "Passwords do not match" });
}

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during signup" });
    }
};

// ✅ LOGIN
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;


        // Check if email, password, role are provided
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Email, password, and role are required." });
        }

        // Find user by email
        const user = await User.findOne({ email }).select("+password");
   


        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 🧩 Role verification
        if (user.role !== role) {
            return res.status(403).json({ message: `${role} not found in this account.` });
        }


        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
  

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials." });
          }
    
        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role ,  name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: `${role} login successful`,
            token,
            role: user.role,
             user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
};

// ✅ GET CURRENT USER (Protected Route)
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Dashboard data fetched successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching user profile" });
    }
};