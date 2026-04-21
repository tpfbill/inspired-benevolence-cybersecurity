import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const deleteRansomwarePlaybook = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete old ORNA Ransomware Response from database
    const deleted = await Playbook.destroy({
      where: {
        name: 'ORNA Ransomware Response'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted "ORNA Ransomware Response" from database');
    } else {
      console.log('! ORNA Ransomware Response not found in database');
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

deleteRansomwarePlaybook();
