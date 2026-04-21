import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const deleteOldRansomware = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Delete "Ransomware Incident Response" from database
    const deleted = await Playbook.destroy({
      where: {
        name: 'Ransomware Incident Response'
      }
    });

    if (deleted > 0) {
      console.log('✓ Deleted "Ransomware Incident Response" from database');
    } else {
      console.log('! Ransomware Incident Response not found in database');
    }

    const count = await Playbook.count();
    console.log(`Total playbooks remaining: ${count}`);
    
    // Verify only one ransomware playbook remains
    const ransomwarePlaybooks = await Playbook.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        {
          [sequelize.Op.like]: '%ransom%'
        }
      ),
      attributes: ['name', 'incidentType']
    });
    
    console.log(`\nRansomware playbooks remaining: ${ransomwarePlaybooks.length}`);
    ransomwarePlaybooks.forEach(p => {
      console.log(`  - ${p.name} (${p.incidentType})`);
    });
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

deleteOldRansomware();
