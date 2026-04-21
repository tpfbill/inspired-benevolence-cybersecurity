import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

async function cleanup() {
  try {
    await sequelize.authenticate();
    console.log('Database connected\n');

    // Find and delete the old ORNA Power Outage Response
    const oldPlaybook = await Playbook.findOne({
      where: { name: 'ORNA Power Outage Response' }
    });

    if (oldPlaybook) {
      await oldPlaybook.destroy();
      console.log('✓ Deleted "ORNA Power Outage Response" from database');
    } else {
      console.log('• "ORNA Power Outage Response" not found in database (may already be deleted)');
    }

    // Update the Barkley playbook name
    const barkleyPlaybook = await Playbook.findOne({
      where: { name: 'ORNA Barkley Power Outage Response' }
    });

    if (barkleyPlaybook) {
      barkleyPlaybook.name = 'Barkley Power Outage Response';
      await barkleyPlaybook.save();
      console.log('✓ Renamed "ORNA Barkley Power Outage Response" to "Barkley Power Outage Response"');
    } else {
      console.log('• "ORNA Barkley Power Outage Response" not found in database');
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
