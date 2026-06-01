// utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // token 7 din baad expire hoga
  );
};

export default generateToken;
