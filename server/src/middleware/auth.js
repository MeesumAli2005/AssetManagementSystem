import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

//Checking the validity of the token

export function requireAuth(req, res, next)
{
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer '))
    {
        return res.status(401).json({message: 'No token provided'});
    }

    const token = authHeader.split(' ')[1];
    try
    {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }

    catch(err)
    {
        return res.status(401).json({message: "Invalid or expired token twin"});
    }
}

//checking the allowed roles
export function requireRole(...allowedRoles)
{
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role))
        {
            return res.status(403).json({message: 'Not enough permissions'});
        }
        next();
    };

}