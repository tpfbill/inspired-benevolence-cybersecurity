import express, { Response } from 'express';
import User, { UserRole } from '../models/User';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

const router = express.Router();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['lastName', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
      return;
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.userId!, {
      attributes: { exclude: ['password'] }
    });

    res.json(user);
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
      return;
  }
});

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
      return;
      }

      const { firstName, lastName, role, department, phone, isActive } = req.body;

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        role: role || user.role,
        department: department !== undefined ? department : user.department,
        phone: phone !== undefined ? phone : user.phone,
        isActive: isActive !== undefined ? isActive : user.isActive
      });

      logger.info(`User updated: ${user.id} by admin ${req.userId}`);

      const updatedUser = user.toJSON();
      delete updatedUser.password;

      res.json(updatedUser);
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }
  }
);

export default router;
