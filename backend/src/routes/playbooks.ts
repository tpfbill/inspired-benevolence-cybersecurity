import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Playbook, { PlaybookStatus, IncidentType } from '../models/Playbook';
import User from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, incidentType } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (incidentType) where.incidentType = incidentType;

    const playbooks = await Playbook.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'modifier', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(playbooks);
  } catch (error) {
    logger.error('Get playbooks error:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
  }
});

router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const playbook = await Playbook.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'modifier', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!playbook) {
      return res.status(404).json({ error: 'Playbook not found' });
    }

    res.json(playbook);
  } catch (error) {
    logger.error('Get playbook error:', error);
    res.status(500).json({ error: 'Failed to fetch playbook' });
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
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        status: PlaybookStatus.DRAFT
      });

      logger.info(`Playbook created: ${playbook.id} by user ${req.userId}`);

      res.status(201).json(playbook);
    } catch (error) {
      logger.error('Create playbook error:', error);
      res.status(500).json({ error: 'Failed to create playbook' });
    }
  }
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SECURITY_ANALYST),
  async (req: AuthRequest, res: Response) => {
    try {
      const playbook = await Playbook.findByPk(req.params.id);

      if (!playbook) {
        return res.status(404).json({ error: 'Playbook not found' });
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
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthRequest, res: Response) => {
    try {
      const playbook = await Playbook.findByPk(req.params.id);

      if (!playbook) {
        return res.status(404).json({ error: 'Playbook not found' });
      }

      await playbook.destroy();

      logger.info(`Playbook deleted: ${req.params.id} by user ${req.userId}`);

      res.json({ message: 'Playbook deleted successfully' });
    } catch (error) {
      logger.error('Delete playbook error:', error);
      res.status(500).json({ error: 'Failed to delete playbook' });
    }
  }
);

export default router;
