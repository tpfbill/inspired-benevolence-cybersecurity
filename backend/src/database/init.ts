import { sequelize } from './connection';
import logger from '../utils/logger';

// Import all models to ensure they're registered with Sequelize
import '../models/User';
import '../models/Role';
import '../models/Playbook';
import '../models/Incident';
import '../models/Alert';
import '../models/Task';
import '../models/TaskProgress';
import '../models/SystemSetting';

async function initializeDatabase() {
  try {
    logger.info('Testing database connection...');
    await sequelize.authenticate();
    logger.info('✅ Database connection established successfully');

    logger.info('Syncing database models...');
    await sequelize.sync({ force: false, alter: true });
    logger.info('✅ Database models synchronized');

    logger.info('Database initialization complete!');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
