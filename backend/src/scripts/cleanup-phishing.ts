import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const cleanupPhishing = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete the old ORNA Phishing Response
    const ornaDeleted = await Playbook.destroy({
      where: {
        name: 'ORNA Phishing Response'
      }
    });

    if (ornaDeleted > 0) {
      console.log('✓ Deleted old "ORNA Phishing Response" playbook');
    }

    // Delete the old Phishing Attack Response
    const deleted = await Playbook.destroy({
      where: {
        name: 'Phishing Attack Response'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted old "Phishing Attack Response" playbook');
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

cleanupPhishing();
