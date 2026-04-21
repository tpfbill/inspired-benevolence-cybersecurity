import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Incident, { IncidentStatus, IncidentSeverity } from '../models/Incident';
import Task, { TaskStatus, TaskPriority } from '../models/Task';
import Playbook from '../models/Playbook';

import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import taskNotificationService from '../services/taskNotificationService';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, severity, incidentType } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (incidentType) where.incidentType = incidentType;

    const incidents = await Incident.findAll({
      where,
      order: [['detectedAt', 'DESC']]
    });

    res.json(incidents);
  } catch (error) {
    logger.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
      return;
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    res.json(incident);
  } catch (error) {
    logger.error('Get incident error:', error);
    res.status(500).json({ error: 'Failed to fetch incident' });
      return;
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
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      return;
        return;
      }

      const { title, description, incidentType, severity, playbookId, affectedSystems } = req.body;

      let playbookSnapshot = null;
      
      // If a playbook is selected, fetch and store snapshot
      if (playbookId) {
        const playbook = await Playbook.findByPk(playbookId);
        if (playbook) {
          playbookSnapshot = {
            id: playbook.id,
            name: playbook.name,
            description: playbook.description,
            version: playbook.version,
            phases: playbook.phases,
            steps: playbook.steps,
            snapshotTakenAt: new Date()
          };
        }
      }

      const incident = await Incident.create({
        title,
        description,
        incidentType,
        severity,
        playbookId,
        playbookSnapshot,
        affectedSystems,
        detectedAt: new Date(),
        reportedBy: req.userId!,
        status: IncidentStatus.DETECTED
      });

      if (playbookId && playbookSnapshot) {
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

      // Auto-notify tasks that are ready (no dependencies)
      if (incident.playbookSnapshot) {
        logger.info(`📧 Sending initial notifications for incident ${incident.id}...`);
        taskNotificationService.notifyReadyTasks(incident.id).catch(error => {
          logger.error('Failed to send initial notifications:', error);
        });
      }

      res.status(201).json(incident);
      return;
    } catch (error) {
      logger.error('Create incident error:', error);
      res.status(500).json({ error: 'Failed to create incident' });
      return;
    }
  }
);

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
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
      return;
  }
});

router.post('/:id/timeline', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
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
      return;
  }
});

// Archive an incident
router.post('/:id/archive', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    const { reason } = req.body;

    await incident.update({
      status: IncidentStatus.ARCHIVED,
      archivedAt: new Date(),
      archivedBy: req.userId,
      archiveReason: reason || 'No reason provided'
    });

    logger.info(`Incident archived: ${incident.id} by user ${req.userId}`);

    res.json(incident);
  } catch (error) {
    logger.error('Archive incident error:', error);
    res.status(500).json({ error: 'Failed to archive incident' });
      return;
  }
});

// Restore an archived incident
router.post('/:id/restore', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    if (incident.status !== IncidentStatus.ARCHIVED) {
      res.status(400).json({ error: 'Incident is not archived' });
      return;
    }

    // Restore to previous status or default to 'detected'
    const restoredStatus = incident.resolvedAt ? 'resolved' : 'investigating';

    await incident.update({
      status: restoredStatus,
      archivedAt: undefined,
      archivedBy: undefined,
      archiveReason: null
    });

    logger.info(`Incident restored: ${incident.id} by user ${req.userId}`);

    res.json(incident);
  } catch (error) {
    logger.error('Restore incident error:', error);
    res.status(500).json({ error: 'Failed to restore incident' });
      return;
  }
});

// Escalate an incident (increase escalation level)
// Delete an incident
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    // Check if incident is in active response (has active playbook)
    if (incident.status === IncidentStatus.INVESTIGATING || incident.status === 'investigating') {
      res.status(400).json({ 
        error: 'Cannot delete an incident that is in active response. Close or archive it first.' 
      });
    }

    const incidentId = incident.id;
    const incidentTitle = incident.title;

    // Delete associated tasks first
    await Task.destroy({
      where: { incidentId: incidentId }
    });

    // Un-link any alerts associated with this incident
    const Alert = require('../models/Alert').default;
    await Alert.update(
      { incidentId: null, status: 'new' },
      { where: { incidentId: incidentId } }
    );

    // Delete the incident
    await incident.destroy();

    io.emit('incident-deleted', { id: incidentId });

    logger.info(`Incident deleted: ${incidentId} (${incidentTitle}) by user ${req.userId}`);

    res.json({ 
      success: true, 
      message: 'Incident deleted successfully',
      deletedId: incidentId 
    });
  } catch (error) {
    logger.error('Delete incident error:', error);
    res.status(500).json({ error: 'Failed to delete incident' });
      return;
  }
});

router.post('/:id/escalate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const incident = await Incident.findByPk(req.params.id);

    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    const currentLevel = incident.escalationLevel || 1;
    const newLevel = currentLevel + 1;

    await incident.update({
      escalationLevel: newLevel
    });

    // Add to timeline
    const timelineEntry = {
      timestamp: new Date(),
      userId: req.userId,
      action: `Escalated to Level ${newLevel}`,
      description: `Incident escalated from Level ${currentLevel} to Level ${newLevel}`
    };

    await incident.update({
      timeline: [...(incident.timeline || []), timelineEntry]
    });

    logger.info(`Incident escalated: ${incident.id} to level ${newLevel} by user ${req.userId}`);

    res.json(incident);
  } catch (error) {
    logger.error('Escalate incident error:', error);
    res.status(500).json({ error: 'Failed to escalate incident' });
      return;
  }
});

export default router;
