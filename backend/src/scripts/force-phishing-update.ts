import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const forceUpdate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete ALL phishing playbooks
    const deleted = await Playbook.destroy({
      where: {
        name: 'Phishing Attack Response'
      }
    });

    console.log(`✓ Deleted ${deleted} "Phishing Attack Response" playbook(s)`);

    const count = await Playbook.count();
    console.log(`Total playbooks remaining: ${count}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

forceUpdate();
