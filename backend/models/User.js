import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   name: {
  type: String,
  required: [true, "Name is required"],
  trim: true,
  minlength: [2, "Name must be at least 2 characters"],
  maxlength: [30, "Name cannot exceed 30 characters"],
  match: [/^[A-Za-z\s]+$/, "Name must contain only letters and spaces"],
},

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ["user", "hostel_owner", "admin"],
        default: "user"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: ""
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;