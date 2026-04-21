import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const deleteDDoSMitigation = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const deleted = await Playbook.destroy({
      where: {
        name: 'DDoS Attack Mitigation'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted "DDoS Attack Mitigation" from database');
    } else {
      console.log('! DDoS Attack Mitigation not found in database');
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

deleteDDoSMitigation();
