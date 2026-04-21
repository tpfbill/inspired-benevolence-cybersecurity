import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import SystemSetting from '../models/SystemSetting';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';
import emailService from '../services/emailService';
import logger from '../utils/logger';

const router = express.Router();

// Get all settings (admin only)
router.get('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await SystemSetting.findAll({
      order: [['settingKey', 'ASC']]
    });

    // Return settings with decrypted values for passwords (masked)
    const settingsData = settings.map(setting => ({
      id: setting.id,
      settingKey: setting.settingKey,
      settingValue: setting.settingType === 'password' 
        ? (setting.settingValue ? '••••••••' : '') 
        : setting.getDecryptedValue(),
      settingType: setting.settingType,
      description: setting.description,
      isEncrypted: setting.isEncrypted,
      updatedAt: setting.updatedAt
    }));

    res.json(settingsData);
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
      return;
  }
});

// Get email settings specifically
router.get('/email', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const emailSettings = await SystemSetting.findAll({
      where: {
        settingKey: [
          'email_smtp_host',
          'email_smtp_port',
          'email_smtp_secure',
          'email_smtp_user',
          'email_smtp_password',
          'email_from',
          'app_url'
        ]
      }
    });

    const settings: Record<string, any> = {};
    emailSettings.forEach(setting => {
      settings[setting.settingKey] = setting.settingType === 'password'
        ? (setting.settingValue ? '••••••••' : '')
        : setting.getDecryptedValue();
    });

    res.json({
      settings,
      isConfigured: emailService.isReady()
    });
  } catch (error) {
    logger.error('Get email settings error:', error);
    res.status(500).json({ error: 'Failed to fetch email settings' });
      return;
  }
});

// Update a setting (admin only)
router.put(
  '/:key',
  authenticate,
  requireAdmin,
  [
    body('value').exists()
  ],
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
      return;
      }

      const { key } = req.params;
      const { value } = req.body;

      const setting = await SystemSetting.findOne({
        where: { settingKey: key }
      });

      if (!setting) {
        res.status(404).json({ error: 'Setting not found' });
      return;
      }

      await setting.setEncryptedValue(value, req.userId);

      // If email settings were updated, reinitialize email service
      if (key.startsWith('email_')) {
        logger.info('Email settings updated, reinitializing email service...');
        // Email service will be reinitialized on next use
      }

      res.json({
        success: true,
        message: 'Setting updated successfully',
        setting: {
          settingKey: setting.settingKey,
          settingValue: setting.settingType === 'password' ? '••••••••' : setting.getDecryptedValue()
        }
      });
    } catch (error) {
      logger.error('Update setting error:', error);
      res.status(500).json({ error: 'Failed to update setting' });
      return;
    }
  }
);

// Update multiple settings at once
router.post(
  '/bulk',
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { settings } = req.body;

      if (!settings || typeof settings !== 'object') {
        res.status(400).json({ error: 'Invalid settings format' });
      return;
      }

      const updatedSettings = [];

      for (const [key, value] of Object.entries(settings)) {
        const setting = await SystemSetting.findOne({
          where: { settingKey: key }
        });

        if (setting && value !== '••••••••') { // Don't update if value is masked
          await setting.setEncryptedValue(value as string, req.userId);
          updatedSettings.push(key);
        }
      }

      // Reinitialize email service if email settings were updated
      if (updatedSettings.some(key => key.startsWith('email_'))) {
        logger.info('Email settings updated, reinitializing email service...');
      }

      res.json({
        success: true,
        message: `Updated ${updatedSettings.length} settings`,
        updatedSettings
      });
    } catch (error) {
      logger.error('Bulk update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
      return;
    }
  }
);

// Test email configuration
router.post('/email/test', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      res.status(400).json({ error: 'Test email address required' });
      return;
    }

    // Get current email settings from database
    const emailSettings = await SystemSetting.findAll({
      where: {
        settingKey: [
          'email_smtp_host',
          'email_smtp_port',
          'email_smtp_secure',
          'email_smtp_user',
          'email_smtp_password',
          'email_from',
          'app_url'
        ]
      }
    });

    const settings: Record<string, string> = {};
    emailSettings.forEach(setting => {
      settings[setting.settingKey] = setting.getDecryptedValue() || '';
    });

    // Check if email is configured
    if (!settings.email_smtp_host || !settings.email_smtp_user) {
      res.status(400).json({ 
        error: 'Email not configured',
        message: 'Please configure SMTP settings first'
      });
    }

    // Send test email
    const success = await emailService.sendEmail({
      to: testEmail,
      subject: '🧪 IB Cybersecurity - Test Email',
      html: `
        <h2>Test Email Successful!</h2>
        <p>If you're reading this, your email configuration is working correctly.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>SMTP Host: ${settings.email_smtp_host}</li>
          <li>SMTP Port: ${settings.email_smtp_port}</li>
          <li>From: ${settings.email_from}</li>
        </ul>
        <p>You can now send task notifications to your team!</p>
      `,
      text: 'Test email from IB Cybersecurity. Your email configuration is working!'
    });

    if (success) {
      res.json({
        success: true,
        message: `Test email sent to ${testEmail}`
      });
    } else {
      res.status(500).json({
        error: 'Failed to send test email',
        message: 'Check the backend logs for details'
      });
    }
  } catch (error) {
    logger.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
