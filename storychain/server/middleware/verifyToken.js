
// server/middleware/verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  // 1. Check cookie
  const cookieToken = req.cookies?.access_token;

  // 2. Check Authorization header (Bearer token)
  const headerAuth = req.header("Authorization");
  const bearerToken = headerAuth?.startsWith("Bearer ")
    ? headerAuth.replace("Bearer ", "")
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user (id, username, etc.)
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default verifyToken;

