import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Incident, { IncidentStatus, IncidentSeverity } from '../models/Incident';
import Task, { TaskStatus, TaskPriority } from '../models/Task';
import Playbook from '../models/Playbook';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, severity, incidentType } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (incidentType) where.incidentType = incidentType;

    const incidents = await Incident.findAll({
      where,
      include: [
        { model: Playbook, as: 'playbook' },
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Task, as: 'tasks' }
      ],
      order: [['detectedAt', 'DESC']]
    });

    res.json(incidents);
  } catch (error) {
    logger.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findByPk(req.params.id, {
      include: [
        { model: Playbook, as: 'playbook' },
        { model: User, as: 'reporter', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Task, as: 'tasks', include: [{ model: User, as: 'assignee', attributes: ['id', 'firstName', 'lastName'] }] }
      ]
    });

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    res.json(incident);
  } catch (error) {
    logger.error('Get incident error:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});

router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('incidentType').notEmpty(),
    body('severity').isIn(Object.values(IncidentSeverity))
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, incidentType, severity, playbookId, affectedSystems } = req.body;

      const incident = await Incident.create({
        title,
        description,
        incidentType,
        severity,
        playbookId,
        affectedSystems,
        reportedBy: req.userId!,
        status: IncidentStatus.DETECTED
      });

      if (playbookId) {
        const playbook = await Playbook.findByPk(playbookId);
        if (playbook) {
          for (const step of playbook.steps) {
            await Task.create({
              incidentId: incident.id,
              title: step.title,
              description: step.description,
              assignedRole: step.assignedRole,
              priority: step.criticalStep ? TaskPriority.CRITICAL : TaskPriority.MEDIUM,
              stepNumber: step.stepNumber,
              status: TaskStatus.PENDING
            });
          }
        }
      }

      io.emit('incident-created', incident);

      logger.info(`Incident created: ${incident.id} by user ${req.userId}`);

      res.status(201).json(incident);
    } catch (error) {
      logger.error('Create incident error:', error);
      res.status(500).json({ error: 'Failed to create incident' });
    }
  }
);

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { status, assignedTo, evidence, timeline, postMortem } = req.body;

    const updates: any = {};
    if (status) updates.status = status;
    if (assignedTo) updates.assignedTo = assignedTo;
    if (evidence) updates.evidence = [...(incident.evidence || []), ...evidence];
    if (timeline) updates.timeline = [...(incident.timeline || []), ...timeline];
    if (postMortem) updates.postMortem = postMortem;

    if (status === IncidentStatus.RESOLVED || status === IncidentStatus.CLOSED) {
      updates.resolvedAt = new Date();
    }

    await incident.update(updates);

    io.to(`incident-${incident.id}`).emit('incident-updated', incident);

    logger.info(`Incident updated: ${incident.id} by user ${req.userId}`);

    res.json(incident);
  } catch (error) {
    logger.error('Update incident error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

router.post('/:id/timeline', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { action, description } = req.body;

    const timelineEntry = {
      timestamp: new Date(),
      userId: req.userId,
      action,
      description
    };

    await incident.update({
      timeline: [...(incident.timeline || []), timelineEntry]
    });

    io.to(`incident-${incident.id}`).emit('timeline-updated', timelineEntry);

    res.json(incident);
  } catch (error) {
    logger.error('Add timeline entry error:', error);
    res.status(500).json({ error: 'Failed to add timeline entry' });
  }
});

export default router;
