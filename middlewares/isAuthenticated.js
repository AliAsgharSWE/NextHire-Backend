import { verifyAccessToken } from "../utils/token.js";

const isAuthenticated = (req, res, next) => {
  try {
    // Prefer signed cookie (browser) but fallback to Authorization header (API/mobile)
    const token =
      req.signedCookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res
        .status(403)
        .json({ message: "Forbidden: Invalid or expired token" });
    }

    req.user = decoded; // attach { id, role } from payload
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default isAuthenticated;
