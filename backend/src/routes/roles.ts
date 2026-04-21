import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Role from '../models/Role';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import logger from '../utils/logger';

const router = express.Router();

// Get all roles
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    });

    res.json(roles);
  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
      return;
  }
});

// Get available permissions
router.get('/permissions', authenticate, authorize(UserRole.ADMIN), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const permissions = [
      { key: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete users' },
      { key: 'manage_roles', label: 'Manage Roles', description: 'Create and edit custom roles' },
      { key: 'manage_playbooks', label: 'Manage Playbooks', description: 'Create, edit, and delete playbooks' },
      { key: 'create_playbooks', label: 'Create Playbooks', description: 'Create new playbooks' },
      { key: 'edit_playbooks', label: 'Edit Playbooks', description: 'Edit existing playbooks' },
      { key: 'view_playbooks', label: 'View Playbooks', description: 'View playbook details' },
      { key: 'manage_incidents', label: 'Manage Incidents', description: 'Full incident management' },
      { key: 'create_incidents', label: 'Create Incidents', description: 'Create new incidents' },
      { key: 'edit_incidents', label: 'Edit Incidents', description: 'Edit existing incidents' },
      { key: 'view_incidents', label: 'View Incidents', description: 'View incident details' },
      { key: 'manage_alerts', label: 'Manage Alerts', description: 'Triage and escalate alerts' },
      { key: 'view_alerts', label: 'View Alerts', description: 'View security alerts' },
      { key: 'view_compliance', label: 'View Compliance', description: 'View compliance reports' },
      { key: 'manage_settings', label: 'Manage Settings', description: 'Configure system settings' },
      { key: 'manage_notifications', label: 'Manage Notifications', description: 'Send and manage notifications' },
      { key: 'manage_communications', label: 'Manage Communications', description: 'Internal communications' },
      { key: 'view_reports', label: 'View Reports', description: 'Access analytics and reports' },
      { key: 'approve_decisions', label: 'Approve Decisions', description: 'Approve critical decisions' }
    ];

    res.json(permissions);
  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
      return;
  }
});

// Create custom role
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  [
    body('name').notEmpty(),
    body('slug').notEmpty().matches(/^[a-z_]+$/),
    body('description').notEmpty(),
    body('permissions').isArray(),
    body('color').notEmpty()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      return;
      }

      const { name, slug, description, permissions, color } = req.body;

      // Check if role already exists
      const existing = await Role.findOne({ where: { slug } });
      if (existing) {
        res.status(400).json({ error: 'Role with this slug already exists' });
      return;
      }

      const role = await Role.create({
        name,
        slug,
        description,
        permissions,
        color,
        isSystem: false
      });

      logger.info(`Custom role created: ${role.name} by user ${req.userId}`);

      res.status(201).json(role);
      return;
    } catch (error) {
      logger.error('Create role error:', error);
      res.status(500).json({ error: 'Failed to create role' });
      return;
    }
  }
);

// Update role
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const role = await Role.findByPk(req.params.id);

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
      return;
      }

      const { name, description, permissions, color } = req.body;

      await role.update({
        name: name || role.name,
        description: description || role.description,
        permissions: permissions || role.permissions,
        color: color || role.color
      });

      logger.info(`Role updated: ${role.name} by user ${req.userId}`);

      res.json(role);
    } catch (error) {
      logger.error('Update role error:', error);
      res.status(500).json({ error: 'Failed to update role' });
      return;
    }
  }
);

// Delete role
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const role = await Role.findByPk(req.params.id);

      if (!role) {
        res.status(404).json({ error: 'Role not found' });
      return;
      }

      await role.destroy();

      logger.info(`Role deleted: ${role.name} by user ${req.userId}`);

      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      logger.error('Delete role error:', error);
      res.status(500).json({ error: 'Failed to delete role' });
      return;
    }
  }
);

export default router;
