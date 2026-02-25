import express, { Response } from 'express';
import Task from '../models/Task';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import logger from '../utils/logger';

const router = express.Router();

// Get all tasks for an incident
router.get('/incident/:incidentId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { incidentId } = req.params;

    const tasks = await Task.findAll({
      where: { incidentId },
      order: [['stepNumber', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json(tasks);
  } catch (error) {
    logger.error('Get incident tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Update task status
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { status, notes, assignedTo } = req.body;

    const updates: any = {};
    if (status) {
      updates.status = status;
      if (status === 'completed') {
        updates.completedAt = new Date();
        updates.completedBy = req.userId;
      }
    }
    if (notes !== undefined) updates.notes = notes;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo || null;

    await task.update(updates);

    // Emit real-time update
    io.to(`incident-${task.incidentId}`).emit('task-updated', task);

    logger.info(`Task updated: ${task.id} by user ${req.userId}`);

    res.json(task);
  } catch (error) {
    logger.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
