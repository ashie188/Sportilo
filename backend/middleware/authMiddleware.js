import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  console.log("authMiddleware called");
  const authHeader = req.headers.authorization;
  console.log("HEADERS:", req.headers);

  if (!authHeader) {
    console.log("no token provided in auth middleware");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // VERY IMPORTANT
    req.user = decoded; // should contain { id, email }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired",
        expired: true,
      });
    }

    return res.status(401).json({
      message: "Invalid token",
    });
  }
};

export default authMiddleware;
