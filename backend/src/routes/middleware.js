import jwt from 'jsonwebtoken';

export const checkRole = (roles) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.replace('Bearer ', '');
            const decoded = jwt.verify(token, "secret");
            if (!roles.includes(decoded.role)) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            next();
                
        } catch (error) {
            return res.status(401).json({ message: 'Token is not valid' });
        }
    }
}

export const handleError = (error, req, res, next) => {
    if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(403)
        res.send({ status: 'error', message: "Resource already exists"});
    } else if (['SequelizeDatabaseError', 'SequelizeValidationError'].includes(error.name)) {
        res.status(400)
        res.send({ status: 'error', message: error.message});
    } else {
        res.status(500)
        res.send({ status: 'error', message: "Something went wrong"});
    }
}