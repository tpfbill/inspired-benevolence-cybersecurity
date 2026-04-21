import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Playbook, { PlaybookStatus, IncidentType } from '../models/Playbook';
// import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, incidentType } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (incidentType) where.incidentType = incidentType;

    const playbooks = await Playbook.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(playbooks);
  } catch (error) {
    logger.error('Get playbooks error:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
      return;
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const playbook = await Playbook.findByPk(req.params.id);

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    res.json(playbook);
  } catch (error) {
    logger.error('Get playbook error:', error);
    res.status(500).json({ error: 'Failed to fetch playbook' });
      return;
  }
});

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SECURITY_ANALYST),
  [
    body('name').notEmpty(),
    body('incidentType').isIn(Object.values(IncidentType)),
    body('description').notEmpty(),
    body('steps').isArray()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      return;
      }

      const { name, incidentType, description, steps, framework, tags } = req.body;

      const playbook = await Playbook.create({
        name,
        incidentType,
        description,
        steps,
        framework,
        tags,
        createdBy: req.userId!,
        phases: [],
        status: PlaybookStatus.DRAFT
      });

      logger.info(`Playbook created: ${playbook.id} by user ${req.userId}`);

      res.status(201).json(playbook);
      return;
    } catch (error) {
      logger.error('Create playbook error:', error);
      res.status(500).json({ error: 'Failed to create playbook' });
      return;
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SECURITY_ANALYST),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const playbook = await Playbook.findByPk(req.params.id);

      if (!playbook) {
        res.status(404).json({ error: 'Playbook not found' });
      return;
      }

      const { name, description, steps, status, framework, tags } = req.body;

      await playbook.update({
        name: name || playbook.name,
        description: description || playbook.description,
        steps: steps || playbook.steps,
        status: status || playbook.status,
        framework: framework || playbook.framework,
        tags: tags || playbook.tags,
        lastModifiedBy: req.userId
      });

      logger.info(`Playbook updated: ${playbook.id} by user ${req.userId}`);

      res.json(playbook);
    } catch (error) {
      logger.error('Update playbook error:', error);
      res.status(500).json({ error: 'Failed to update playbook' });
      return;
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const playbook = await Playbook.findByPk(req.params.id);

      if (!playbook) {
        res.status(404).json({ error: 'Playbook not found' });
      return;
      }

      await playbook.destroy();

      logger.info(`Playbook deleted: ${req.params.id} by user ${req.userId}`);

      res.json({ message: 'Playbook deleted successfully' });
    } catch (error) {
      logger.error('Delete playbook error:', error);
      res.status(500).json({ error: 'Failed to delete playbook' });
      return;
    }
  }
);

export default router;
