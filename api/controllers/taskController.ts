import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db';

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const { status } = req.query;
        const userId = 1; // mock it for now, circle back if there is time 

        let query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
        const params: any[] = [userId];

        if (status === 'pending' || status === 'completed') {
            query = 'SELECT * FROM tasks WHERE user_id = ? AND status = ? ORDER BY created_at DESC';
            params.push(status);
        }

        const tasks = await db.all(query, params);
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        next(error);
    }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const userId = 1;
        const { title, description, due_date } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '') {
            res.status(400).json({ success: false, error: 'Title is required and must be a string.' });
            return;
        }

        const result = await db.run(
            `INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)`,
            [userId, title.trim(), description?.trim() || null, due_date || null]
        );

        res.status(201).json({
            success: true,
            data: { id: result.lastID, title, description, status: 'pending', due_date }
        });
    } catch (error) {
        next(error);
    }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const { title, description, status, due_date } = req.body;
        const userId = 1;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({ success: false, error: 'Valid Task ID is required.' });
            return;
        }

        if (status && !['pending', 'completed'].includes(status)) {
            res.status(400).json({ success: false, error: 'Status must be pending or completed.' });
            return;
        }

        if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
            res.status(400).json({ success: false, error: 'Title cannot be empty.' });
            return;
        }

        const result = await db.run(
            `UPDATE tasks
             SET title = COALESCE(?, title),
                 description = COALESCE(?, description),
                 status = COALESCE(?, status),
                 due_date = COALESCE(?, due_date)
             WHERE id = ? AND user_id = ?`,
            [title, description, status, due_date, id, userId]
        );

        if (result.changes === 0) {
            res.status(404).json({ success: false, error: 'Task not found or unauthorized.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Task updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const db = await getDb();
        const { id } = req.params;
        const userId = 1;

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