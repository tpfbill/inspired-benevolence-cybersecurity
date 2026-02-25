import axios from 'axios';
import Alert, { AlertSeverity, AlertStatus } from '../models/Alert';
import logger from '../utils/logger';

interface ManageEngineConfig {
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
}

interface ManageEngineAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  timestamp: string;
  source: string;
  affectedAssets?: string[];
  [key: string]: any;
}

export class ManageEngineIntegration {
  private config: ManageEngineConfig;

  constructor(config: ManageEngineConfig) {
    this.config = config;
  }

  /**
   * Map ManageEngine severity to our system's severity levels
   */
  private mapSeverity(meSeverity: string): AlertSeverity {
    const severityMap: { [key: string]: AlertSeverity } = {
      'critical': AlertSeverity.CRITICAL,
      'high': AlertSeverity.HIGH,
      'medium': AlertSeverity.MEDIUM,
      'low': AlertSeverity.LOW,
      'info': AlertSeverity.INFO,
      'informational': AlertSeverity.INFO
    };

    return severityMap[meSeverity.toLowerCase()] || AlertSeverity.MEDIUM;
  }

  /**
   * Fetch alerts from ManageEngine
   */
  async fetchAlerts(since?: Date): Promise<ManageEngineAlert[]> {
    if (!this.config.enabled) {
      logger.info('ManageEngine integration is disabled');
      return [];
    }

    try {
      const params: any = {
        limit: 100,
        status: 'open'
      };

      if (since) {
        params.since = since.toISOString();
      }

      const response = await axios.get(`${this.config.apiUrl}/api/alerts`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        params,
        timeout: 30000
      });

      return response.data.alerts || [];
    } catch (error: any) {
      logger.error('Error fetching ManageEngine alerts:', {
        message: error.message,
        status: error.response?.status,
        url: this.config.apiUrl
      });
      return [];
    }
  }

  /**
   * Import alerts into the IBC platform
   */
  async importAlerts(since?: Date): Promise<{ imported: number; errors: number }> {
    let imported = 0;
    let errors = 0;

    try {
      const meAlerts = await this.fetchAlerts(since);
      logger.info(`Fetched ${meAlerts.length} alerts from ManageEngine`);

      for (const meAlert of meAlerts) {
        try {
          // Check if alert already exists
          const existing = await Alert.findOne({
            where: {
              source: 'ManageEngine',
              rawData: {
                externalId: meAlert.id
              }
            }
          });

          if (existing) {
            continue; // Skip duplicates
          }

          // Create new alert
          await Alert.create({
            title: meAlert.title,
            description: meAlert.description,
            source: 'ManageEngine',
            severity: this.mapSeverity(meAlert.severity),
            status: AlertStatus.NEW,
            detectedAt: new Date(meAlert.timestamp),
            affectedAssets: meAlert.affectedAssets || [],
            rawData: {
              externalId: meAlert.id,
              ...meAlert
            }
          });

          imported++;
        } catch (error) {
          logger.error('Error importing alert:', error);
          errors++;
        }
      }

      logger.info(`ManageEngine import complete: ${imported} imported, ${errors} errors`);
      return { imported, errors };
    } catch (error) {
      logger.error('Error in ManageEngine import process:', error);
      return { imported, errors };
    }
  }

  /**
   * Test connection to ManageEngine
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.apiUrl}/api/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        timeout: 10000
      });

      return response.status === 200;
    } catch (error) {
      logger.error('ManageEngine connection test failed:', error);
      return false;
    }
  }
}

/**
 * Initialize ManageEngine integration from environment variables
 */
export function initManageEngineIntegration(): ManageEngineIntegration {
  const config: ManageEngineConfig = {
    apiUrl: process.env.MANAGEENGINE_API_URL || '',
    apiKey: process.env.MANAGEENGINE_API_KEY || '',
    enabled: process.env.MANAGEENGINE_ENABLED === 'true'
  };

  return new ManageEngineIntegration(config);
}
