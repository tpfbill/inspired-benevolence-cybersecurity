import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Alert, { AlertStatus, AlertSeverity } from '../models/Alert';
import { authenticate, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
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
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, description, source, severity, rawData, affectedAssets } = req.body;

      const alert = await Alert.create({
        title,
        description,
        source,
        severity,
        rawData,
        affectedAssets,
        status: AlertStatus.NEW
      });

      io.emit('alert-created', alert);

      logger.info(`Alert created: ${alert.id}`);

      res.status(201).json(alert);
    } catch (error) {
      logger.error('Create alert error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  }
);

router.put('/:id/acknowledge', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
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
  }
});

router.put('/:id/escalate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await Alert.findByPk(req.params.id);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
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
  }
});

export default router;
