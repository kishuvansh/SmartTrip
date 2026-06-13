import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase-admin';

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized: No token provided' });
            return;
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};
