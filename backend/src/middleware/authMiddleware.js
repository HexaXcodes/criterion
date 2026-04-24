const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  console.log("MIDDLEWARE RUNNING");
  try {
    const authHeader = req.headers.authorization;
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid token: " + error.message });
  }
};

module.exports = protect;