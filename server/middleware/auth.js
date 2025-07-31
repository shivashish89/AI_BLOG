import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = decoded.email === process.env.ADMIN_EMAIL;
        req.user = {
      id: decoded.id || decoded._id, // Ensure compatibility
      email: decoded.email,
      name: decoded.name,
      role: isAdmin ? "admin" : "user"
    };
    
    next();
  } catch (error) {
    res.json({ success: false, message: "Invalid token" });
  }
};

export default auth;
