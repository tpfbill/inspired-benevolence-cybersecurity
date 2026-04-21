import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import TaskProgress from '../models/TaskProgress';
import { authenticate, AuthRequest } from '../middleware/auth';
import taskNotificationService from '../services/taskNotificationService';
import logger from '../utils/logger';

const router = express.Router();

// Get task progress for an incident
router.get('/incident/:incidentId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { incidentId } = req.params;
    
    const progress = await TaskProgress.findAll({
      where: { incidentId },
      order: [['createdAt', 'ASC']]
    });

    res.json(progress);
  } catch (error) {
    logger.error('Get task progress error:', error);
    res.status(500).json({ error: 'Failed to fetch task progress' });
      return;
  }
});

// Update task completion status
router.post(
  '/',
  authenticate,
  [
    body('incidentId').notEmpty(),
    body('phase').notEmpty(),
    body('taskId').notEmpty(),
    body('completed').isBoolean()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      return;
      }

      const { incidentId, phase, taskId, subtaskId, completed, notes } = req.body;

      // Check if progress record already exists
      const where: any = { incidentId, phase, taskId };
      if (subtaskId) where.subtaskId = subtaskId;

      let progress = await TaskProgress.findOne({ where });

      if (progress) {
        // Update existing
        await progress.update({
          completed,
          completedBy: completed ? req.userId : undefined,
          completedAt: completed ? new Date() : undefined,
          notes
        });
      } else {
        // Create new
        progress = await TaskProgress.create({
          incidentId,
          phase,
          taskId,
          subtaskId,
          completed,
          completedBy: completed ? req.userId : undefined,
          completedAt: completed ? new Date() : undefined,
          notes
        });
      }

      // If task was just completed, check for dependent tasks and notify
      if (completed) {
        logger.info(`✅ Task ${taskId} completed, checking for dependent tasks...`);
        const notifiedCount = await taskNotificationService.notifyDependentTasks(incidentId, taskId);
        if (notifiedCount > 0) {
          logger.info(`📧 Notified ${notifiedCount} users about newly available tasks`);
        }
      }

      res.json(progress);
    } catch (error) {
      logger.error('Update task progress error:', error);
      res.status(500).json({ error: 'Failed to update task progress' });
      return;
    }
  }
);

// Get progress summary for an incident
router.get('/incident/:incidentId/summary', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { incidentId } = req.params;
    
    const allProgress = await TaskProgress.findAll({
      where: { incidentId }
    });

    const summary: any = {
      total: allProgress.length,
      completed: allProgress.filter(p => p.completed).length,
      pending: allProgress.filter(p => !p.completed).length,
      percentComplete: 0,
      byPhase: {}
    };

    if (summary.total > 0) {
      summary.percentComplete = Math.round((summary.completed / summary.total) * 100);
    }

    // Group by phase
    allProgress.forEach(progress => {
      if (!summary.byPhase[progress.phase]) {
        summary.byPhase[progress.phase] = {
          total: 0,
          completed: 0,
          pending: 0
        };
      }
      summary.byPhase[progress.phase].total++;
      if (progress.completed) {
        summary.byPhase[progress.phase].completed++;
      } else {
        summary.byPhase[progress.phase].pending++;
      }
    });

    res.json(summary);
  } catch (error) {
    logger.error('Get progress summary error:', error);
    res.status(500).json({ error: 'Failed to fetch progress summary' });
      return;
  }
});

export default router;
