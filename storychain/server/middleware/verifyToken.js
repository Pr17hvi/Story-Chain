// verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message || err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default verifyToken;
