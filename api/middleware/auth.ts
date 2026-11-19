import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'fbc23-diagnostic-secret';

export interface AuthRequest extends Request {
    userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
    }
};