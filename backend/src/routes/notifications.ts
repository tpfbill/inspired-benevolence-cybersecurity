import express, { Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import taskNotificationService from '../services/taskNotificationService';
import emailService from '../services/emailService';
import logger from '../utils/logger';

const router = express.Router();

// Send notifications for all ready tasks in an incident
router.post('/incident/:incidentId/notify', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { incidentId } = req.params;

    logger.info(`📧 Sending notifications for incident ${incidentId} by user ${req.userId}`);

    const result = await taskNotificationService.notifyReadyTasks(incidentId);

    res.json({
      success: true,
      message: `Sent ${result.notified} notifications`,
      ...result
    });
  } catch (error) {
    logger.error('Notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send notifications',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check email service status
router.get('/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const isReady = emailService.isReady();
  
  res.json({
    configured: isReady,
    mode: isReady ? 'production' : 'test (logs only)',
    message: isReady 
      ? 'Email service is configured and ready' 
      : 'Email service in test mode. Configure SMTP in .env to send real emails.'
  });
});

// Clear notification history for an incident (for testing)
router.delete('/incident/:incidentId/history', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { incidentId } = req.params;
    
    taskNotificationService.clearNotificationHistory(incidentId);
    
    res.json({
      success: true,
      message: 'Notification history cleared'
    });
  } catch (error) {
    logger.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear notification history' });
      return;
  }
});

export default router;
