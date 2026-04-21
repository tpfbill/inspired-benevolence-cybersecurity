import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const finalCleanup = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // List all playbooks with "phishing" in the name
    const phishingPlaybooks = await Playbook.findAll({
      where: {},
      attributes: ['id', 'name', 'incidentType']
    });

    console.log('\nAll playbooks:');
    phishingPlaybooks
      .filter((p: any) => p.name.toLowerCase().includes('phishing'))
      .forEach((p: any) => {
        console.log(`- ${p.name} (ID: ${p.id}, Type: ${p.incidentType})`);
      });

    // Delete ORNA Phishing Response if it exists
    const deleted = await Playbook.destroy({
      where: {
        name: 'ORNA Phishing Response'
      }
    });

    if (deleted > 0) {
      console.log('\n✓ Deleted "ORNA Phishing Response"');
    } else {
      console.log('\n! "ORNA Phishing Response" not found in database');
    }

    // Show final count
    const count = await Playbook.count();
    console.log(`\nTotal playbooks in database: ${count}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

finalCleanup();
