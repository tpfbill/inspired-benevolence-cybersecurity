import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const deleteOldDoS = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const deleted = await Playbook.destroy({
      where: {
        name: 'ORNA Denial of Service Response'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted "ORNA Denial of Service Response" from database');
    } else {
      console.log('! ORNA Denial of Service Response not found in database');
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

deleteOldDoS();
