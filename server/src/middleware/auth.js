// requireAuth checks the jwt, requireRole checks what's in it
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;


export function checkTokenValidity(headers, ignoreExpiration = false)
{
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
  {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration });
    return decoded;
  }

  catch (err) { 
    return null;
  }

}

export function requireAuth(req, res, next) {
  const decoded = checkTokenValidity(req.headers, false);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

export function requireAuthOptional(req, res, next) {
  const decoded = checkTokenValidity(req.headers, true);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

//checking the allowed roles
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not enough permissions" });
    }
    next();
  };
}
