import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({
            succeeded: false, 
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(' ')[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded
        next();
    }catch(error)
    {
        return res.status(403).json({
            succeeded: false,
            message: "Invalid token OR Expired token."
        })
    }
}