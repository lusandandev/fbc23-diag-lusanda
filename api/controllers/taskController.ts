import { Response, NextFunction } from 'express';
import { getDb } from '../db';
import { AuthRequest } from '../middleware/auth';

const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;

    return date.toISOString().split('T')[0] === dateString;
};

export const getTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const { status } = req.query;
        const userId = req.userId;

        if (status && !['pending', 'completed'].includes(status as string)) {
            res.status(400).json({ success: false, error: 'Invalid status filter. Must be pending or completed.' });
            return;
        }

        let query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
        const params: any[] = [userId];

        if (status) {
            query = 'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC';
            params.push(status);
        }

        const tasks = await db.all(query, params);
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const userId = req.userId;
        let { title, description, due_date } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '' || title.length > 255) {
            res.status(400).json({ success: false, error: 'Title is required, must be a string, and under 255 characters.' });
            return;
        }
        if (description !== undefined && description !== null) {
            if (typeof description !== 'string' || description.length > 2000) {
                res.status(400).json({ success: false, error: 'Description must be a string under 2000 characters.' });
                return;
            }
        }
        if (due_date !== undefined && due_date !== null) {
            if (typeof due_date !== 'string' || !isValidDate(due_date)) {
                res.status(400).json({ success: false, error: 'Invalid due date format. Must be a valid YYYY-MM-DD.' });
                return;
            }
        }

        title = title.trim();
        description = description ? description.trim() : null;

        const result = await db.run(
            `INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)`,
            [userId, title, description, due_date || null]
        );

        res.status(201).json({
            success: true,
            data: { id: result.lastID, title, description, status: 'pending', due_date: due_date || null }
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { title, description, status, due_date } = req.body;
        const userId = req.userId;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ success: false, error: 'Valid Task ID is required.' });
            return;
        }

        const updates: string[] = [];
        const params: any[] = [];

        if (title !== undefined) {
            if (typeof title !== 'string' || title.trim() === '' || title.length > 255) {
                res.status(400).json({ success: false, error: 'Invalid title.' });
                return;
            }
            updates.push('title = ?');
            params.push(title.trim());
        }
        if (description !== undefined) {
            if (description !== null && (typeof description !== 'string' || description.length > 2000)) {
                res.status(400).json({ success: false, error: 'Invalid description.' });
                return;
            }
            updates.push('description = ?');
            params.push(description ? description.trim() : null);
        }
        if (status !== undefined) {
            if (!['pending', 'completed'].includes(status)) {
                res.status(400).json({ success: false, error: 'Status must be pending or completed.' });
                return;
            }
            updates.push('status = ?');
            params.push(status);
        }
        if (due_date !== undefined) {
            if (due_date !== null && (typeof due_date !== 'string' || !isValidDate(due_date))) {
                res.status(400).json({ success: false, error: 'Invalid due date format.' });
                return;
            }
            updates.push('due_date = ?');
            params.push(due_date);
        }

        if (updates.length === 0) {
            res.status(400).json({ success: false, error: 'No fields provided to update.' });
            return;
        }

        const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
        params.push(id, userId);

        const result = await db.run(query, params);

        if (result.changes === 0) {
            res.status(404).json({ success: false, error: 'Task not found or unauthorized.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Task updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const userId = req.userId;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ success: false, error: 'Valid Task ID is required.' });
            return;
        }

        const result = await db.run(`DELETE FROM tasks WHERE id = ? AND user_id = ?`, [id, userId]);

        if (result.changes === 0) {
            res.status(404).json({ success: false, error: 'Task not found or unauthorized.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (error) {
        next(error);
    }
};