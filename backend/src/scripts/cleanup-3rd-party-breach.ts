import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    // Find and delete the old ORNA 3rd Party Breach Response
    const oldPlaybook = await Playbook.findOne({
      where: { name: 'ORNA 3rd Party Breach Response' }
    });

    if (oldPlaybook) {
      await oldPlaybook.destroy();
      console.log('✓ Deleted "ORNA 3rd Party Breach Response" from database');
    } else {
      console.log('• "ORNA 3rd Party Breach Response" not found in database');
    }

    const total = await Playbook.count();
    console.log(`\n✅ Total playbooks in database: ${total}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanup();
