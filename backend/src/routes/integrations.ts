import express, { Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import { initManageEngineIntegration } from '../integrations/manageengine';
import logger from '../utils/logger';

const router = express.Router();

// Test ManageEngine connection
router.post(
  '/manageengine/test',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SECURITY_ANALYST),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const integration = initManageEngineIntegration();
      const isConnected = await integration.testConnection();

      res.json({
        success: isConnected,
        message: isConnected ? 'Connection successful' : 'Connection failed'
      });
    } catch (error) {
      logger.error('ManageEngine test error:', error);
      res.status(500).json({ error: 'Failed to test connection' });
      return;
    }
  }
);

// Import alerts from ManageEngine
router.post(
  '/manageengine/import',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SECURITY_ANALYST),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { since } = req.body;
      const sinceDate = since ? new Date(since) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours

      const integration = initManageEngineIntegration();
      const result = await integration.importAlerts(sinceDate);

      logger.info(`ManageEngine import triggered by user ${req.userId}: ${result.imported} alerts imported`);

      res.json({
        success: true,
        imported: result.imported,
        errors: result.errors,
        message: `Successfully imported ${result.imported} alerts`
      });
    } catch (error) {
      logger.error('ManageEngine import error:', error);
      res.status(500).json({ error: 'Failed to import alerts' });
      return;
    }
  }
);

// Get integration status
router.get(
  '/status',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const integrations = {
        manageengine: {
          enabled: process.env.MANAGEENGINE_ENABLED === 'true',
          configured: !!(process.env.MANAGEENGINE_API_URL && process.env.MANAGEENGINE_API_KEY)
        },
        siem: {
          enabled: false,
          configured: false
        },
        email: {
          enabled: process.env.EMAIL_ENABLED === 'true',
          configured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER)
        }
      };

      res.json(integrations);
    } catch (error) {
      logger.error('Get integration status error:', error);
      res.status(500).json({ error: 'Failed to get integration status' });
      return;
    }
  }
);

export default router;
