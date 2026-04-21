import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Alert, { AlertStatus, AlertSeverity } from '../models/Alert';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, severity, source } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (source) where.source = source;

    const alerts = await Alert.findAll({
      where,
      order: [['detectedAt', 'DESC']],
      limit: 100
    });

    res.json(alerts);
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
      return;
  }
});

router.post(
  '/',
  authenticate,
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('source').notEmpty(),
    body('severity').isIn(Object.values(AlertSeverity))
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      return;
        return;
      }

      const { title, description, source, severity, rawData, affectedAssets } = req.body;

      const alert = await Alert.create({
        title,
        description,
        source,
        severity,
        rawData,
        affectedAssets,
        detectedAt: new Date(),
        status: AlertStatus.NEW
      });

      io.emit('alert-created', alert);

      logger.info(`Alert created: ${alert.id}`);

      res.status(201).json(alert);
      return;
    } catch (error) {
      logger.error('Create alert error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
      return;
    }
  }
);

router.put('/:id/acknowledge', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
      return;
    }

    await alert.update({
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgedBy: req.userId,
      acknowledgedAt: new Date()
    });

    io.emit('alert-acknowledged', alert);

    logger.info(`Alert acknowledged: ${alert.id} by user ${req.userId}`);

    res.json(alert);
  } catch (error) {
    logger.error('Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
      return;
  }
});

router.put('/:id/escalate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
      return;
    }

    const { incidentId } = req.body;

    await alert.update({
      status: AlertStatus.ESCALATED,
      incidentId
    });

    io.emit('alert-escalated', { alert, incidentId });

    logger.info(`Alert escalated: ${alert.id} to incident ${incidentId}`);

    res.json(alert);
  } catch (error) {
    logger.error('Escalate alert error:', error);
    res.status(500).json({ error: 'Failed to escalate alert' });
      return;
  }
});

// Archive an alert
router.post('/:id/archive', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
      return;
    }

    const { reason } = req.body;

    await alert.update({
      status: AlertStatus.ARCHIVED,
      archivedAt: new Date(),
      archivedBy: req.userId,
      archiveReason: reason || 'No reason provided'
    });

    logger.info(`Alert archived: ${alert.id} by user ${req.userId}`);

    res.json(alert);
  } catch (error) {
    logger.error('Archive alert error:', error);
    res.status(500).json({ error: 'Failed to archive alert' });
      return;
  }
});

// Restore an archived alert
router.post('/:id/restore', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
      return;
    }

    if (alert.status !== AlertStatus.ARCHIVED) {
      res.status(400).json({ error: 'Alert is not archived' });
      return;
      return;
    }

    // Restore to previous status or default to 'new'
    const restoredStatus = alert.acknowledgedAt ? AlertStatus.RESOLVED : AlertStatus.NEW;

    await alert.update({
      status: restoredStatus,
      archivedAt: undefined,
      archivedBy: undefined,
      archiveReason: undefined
    });

    logger.info(`Alert restored: ${alert.id} by user ${req.userId}`);

    res.json(alert);
  } catch (error) {
    logger.error('Restore alert error:', error);
    res.status(500).json({ error: 'Failed to restore alert' });
      return;
  }
});

// Delete an alert
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
      return;
    }

    // Check if alert is escalated to an incident
    if (alert.incidentId) {
      res.status(400).json({ 
        error: 'Cannot delete alert that has been escalated to an incident. Archive it instead.' 
      });
      return;
    }

    const alertId = alert.id;
    const alertTitle = alert.title;

    await alert.destroy();

    io.emit('alert-deleted', { id: alertId });

    logger.info(`Alert deleted: ${alertId} (${alertTitle}) by user ${req.userId}`);

    res.json({ 
      success: true, 
      message: 'Alert deleted successfully',
      deletedId: alertId 
    });
  } catch (error) {
    logger.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
      return;
  }
});

// Bulk delete alerts
router.post('/bulk-delete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertIds } = req.body;

    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      res.status(400).json({ error: 'Alert IDs array is required' });
      return;
      return;
    }

    // Find alerts and check if any are escalated
    const alerts = await Alert.findAll({
      where: {
        id: alertIds
      }
    });

    const escalatedAlerts = alerts.filter(a => a.incidentId);
    if (escalatedAlerts.length > 0) {
      res.status(400).json({ 
        error: `Cannot delete ${escalatedAlerts.length} alert(s) that have been escalated to incidents`,
        escalatedIds: escalatedAlerts.map(a => a.id)
      });
      return;
    }

    // Delete alerts
    const deleted = await Alert.destroy({
      where: {
        id: alertIds
      }
    });

    io.emit('alerts-bulk-deleted', { ids: alertIds, count: deleted });

    logger.info(`Bulk deleted ${deleted} alerts by user ${req.userId}`);

    res.json({ 
      success: true, 
      message: `Successfully deleted ${deleted} alert(s)`,
      deleted 
    });
  } catch (error) {
    logger.error('Bulk delete alerts error:', error);
    res.status(500).json({ error: 'Failed to bulk delete alerts' });
      return;
  }
});

export default router;
