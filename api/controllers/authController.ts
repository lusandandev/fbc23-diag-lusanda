import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db';
import { JWT_SECRET } from '../middleware/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ success: false, error: 'Email and password are required' });
        return;
    }

    try {
        const db = await getDb();
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};