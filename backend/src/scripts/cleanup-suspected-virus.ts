import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const cleanupVirus = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const deleted = await Playbook.destroy({
      where: {
        name: 'ORNA Suspected Virus Response'
      }
    });

    console.log(`✓ Deleted ${deleted} "ORNA Suspected Virus Response" playbook(s)`);

    const count = await Playbook.count();
    console.log(`Total playbooks remaining: ${count}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanupVirus();
