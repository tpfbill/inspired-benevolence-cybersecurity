import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const deleteTestPlaybook = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete Test Playbook from database
    const deleted = await Playbook.destroy({
      where: {
        name: 'Test Playbook'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted "Test Playbook" from database');
    } else {
      console.log('! Test Playbook not found in database');
    }

    const count = await Playbook.count();
    console.log(`Total playbooks remaining: ${count}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteTestPlaybook();
