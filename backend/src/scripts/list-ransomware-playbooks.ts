import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const listRansomwarePlaybooks = async () => {
  try {
    await sequelize.authenticate();
    
    const allPlaybooks = await Playbook.findAll({
      attributes: ['id', 'name', 'incidentType', 'description', 'phases', 'steps'],
      order: [['name', 'ASC']]
    });
    
    console.log('All playbooks in database:\n');
    allPlaybooks.forEach((p, i) => {
      const isRansomware = p.name.toLowerCase().includes('ransom');
      const marker = isRansomware ? '>>> ' : '    ';
      console.log(`${marker}${i + 1}. ${p.name} (${p.incidentType})`);
    });
    
    console.log(`\nTotal: ${allPlaybooks.length} playbooks`);
    
    const ransomwarePlaybooks = allPlaybooks.filter(p => p.name.toLowerCase().includes('ransom'));
    console.log(`\n=== Ransomware playbooks found: ${ransomwarePlaybooks.length} ===\n`);
    
    ransomwarePlaybooks.forEach((p) => {
      console.log(`Name: ${p.name}`);
      console.log(`  Incident Type: ${p.incidentType}`);
      console.log(`  Description: ${p.description?.substring(0, 100)}...`);
      
      // Check structure
      if (p.phases && Array.isArray(p.phases)) {
        const phases = p.phases as any[];
        const totalTasks = phases.reduce((sum, phase) => sum + (phase.tasks?.length || 0), 0);
        console.log(`  Structure: ${phases.length} phases, ${totalTasks} tasks (NEW FORMAT)`);
      } else if (p.steps && Array.isArray(p.steps)) {
        const steps = p.steps as any[];
        console.log(`  Structure: ${steps.length} steps (OLD FORMAT)`);
      }
      console.log();
    });
    
    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listRansomwarePlaybooks();
