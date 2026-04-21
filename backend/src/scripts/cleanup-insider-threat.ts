import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const deleteOldInsiderThreat = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const deleted = await Playbook.destroy({
      where: {
        name: 'ORNA Insider Threat Response'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted "ORNA Insider Threat Response" from database');
    } else {
      console.log('! ORNA Insider Threat Response not found in database');
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

deleteOldInsiderThreat();
