import nodemailer from 'nodemailer';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_SECURE,
      SMTP_USER,
      SMTP_PASSWORD,
      EMAIL_FROM,
      NODE_ENV
    } = process.env;

    // If running in development without email config, use test mode
    if (NODE_ENV === 'development' && !SMTP_HOST) {
      logger.info('📧 Email service running in TEST MODE (logs only)');
      this.isConfigured = false;
      return;
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      logger.warn('⚠️  Email service not configured. Set SMTP credentials in .env');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || '587'),
        secure: SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASSWORD,
        },
      });

      this.isConfigured = true;
      logger.info('✅ Email service configured successfully');
    } catch (error) {
      logger.error('❌ Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const { to, subject, html, text } = options;

    // Test mode - just log the email
    if (!this.isConfigured) {
      logger.info('📧 [TEST MODE] Email would be sent:');
      logger.info(`   To: ${to}`);
      logger.info(`   Subject: ${subject}`);
      logger.info(`   Body: ${text || html.substring(0, 100)}...`);
      return true; // Simulate success
    }

    try {
      const info = await this.transporter!.sendMail({
        from: process.env.EMAIL_FROM || 'IB Cybersecurity <noreply@ibcybersecurity.com>',
        to,
        subject,
        text: text || '',
        html,
      });

      logger.info(`✅ Email sent successfully to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}:`, error);
      return false;
    }
  }

  async sendTaskNotification(
    userEmail: string,
    userName: string,
    taskData: {
      incidentId: string;
      incidentTitle: string;
      taskTitle: string;
      taskDescription: string;
      phase: string;
      estimatedTime?: string;
      outcome?: string;
      incidentUrl: string;
    }
  ): Promise<boolean> {
    const subject = `🔔 Task Assigned: ${taskData.taskTitle}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
          .task-title { font-size: 20px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
          .task-detail { margin: 10px 0; }
          .task-label { font-weight: bold; color: #555; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .badge { display: inline-block; background: #e0e7ff; color: #667eea; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Task Assigned</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">You have been assigned a task for incident response</p>
          </div>
          
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            
            <p>You have been assigned a task for the following incident:</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <strong>📋 Incident:</strong> ${taskData.incidentTitle}<br>
              <span class="badge">${taskData.phase.toUpperCase()}</span>
            </div>
            
            <div class="task-box">
              <div class="task-title">${taskData.taskTitle}</div>
              
              <div class="task-detail">
                <div class="task-label">Description:</div>
                ${taskData.taskDescription}
              </div>
              
              ${taskData.estimatedTime ? `
                <div class="task-detail">
                  <div class="task-label">⏱️ Estimated Time:</div>
                  ${taskData.estimatedTime}
                </div>
              ` : ''}
              
              ${taskData.outcome ? `
                <div class="task-detail">
                  <div class="task-label">🎯 Expected Outcome:</div>
                  ${taskData.outcome}
                </div>
              ` : ''}
            </div>
            
            <a href="${taskData.incidentUrl}" class="btn">View Incident & Complete Task →</a>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              💡 <strong>Tip:</strong> Click the link above to view the full incident details and mark the task as complete when finished.
            </p>
          </div>
          
          <div class="footer">
            <p>This is an automated notification from IB Cybersecurity Incident Response Platform</p>
            <p>© 2026 IB Cybersecurity. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
New Task Assigned

Hi ${userName},

You have been assigned a task for incident: ${taskData.incidentTitle}

Task: ${taskData.taskTitle}
Phase: ${taskData.phase}
Description: ${taskData.taskDescription}
${taskData.estimatedTime ? `Estimated Time: ${taskData.estimatedTime}` : ''}
${taskData.outcome ? `Expected Outcome: ${taskData.outcome}` : ''}

View incident: ${taskData.incidentUrl}

---
IB Cybersecurity Incident Response Platform
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
      text,
    });
  }

  isReady(): boolean {
    return this.isConfigured;
  }
}

export default new EmailService();
