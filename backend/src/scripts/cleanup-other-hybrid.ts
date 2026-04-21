import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const cleanupOtherHybrid = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete the old ORNA Other/Hybrid Incident Response
    const deleted = await Playbook.destroy({
      where: {
        name: 'ORNA Other/Hybrid Incident Response'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted old "ORNA Other/Hybrid Incident Response" playbook');
    } else {
      console.log('! Playbook not found or already deleted');
    }

    // Show total count
    const count = await Playbook.count();
    console.log(`\nTotal playbooks in database: ${count}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupOtherHybrid();
