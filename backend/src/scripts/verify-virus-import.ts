import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const verifyImport = async () => {
  try {
    await sequelize.authenticate();
    
    const playbook = await Playbook.findOne({
      where: {
        name: 'Suspected Virus Response'
      }
    });

    if (playbook) {
      console.log('✓ Suspected Virus Response found in database');
      console.log('  Name:', playbook.name);
      console.log('  Description:', playbook.description.substring(0, 80) + '...');
      console.log('  Incident Type:', playbook.incidentType);
      console.log('  Has phases:', !!playbook.phases);
      console.log('  Number of phases:', playbook.phases?.length || 0);
      
      if (playbook.phases && playbook.phases.length > 0) {
        let totalTasks = 0;
        playbook.phases.forEach((phase: any) => {
          totalTasks += phase.tasks?.length || 0;
          console.log(`\n  Phase: ${phase.phase}`);
          console.log(`    Tasks: ${phase.tasks?.length || 0}`);
          if (phase.tasks && phase.tasks[0]) {
            console.log(`    First task: ${phase.tasks[0].title}`);
            console.log(`    Subtasks: ${phase.tasks[0].subtasks?.length || 0}`);
          }
        });
        console.log(`\n  Total tasks across all phases: ${totalTasks}`);
      }
    } else {
      console.log('✗ Suspected Virus Response NOT found in database!');
    }

    const totalCount = await Playbook.count();
    console.log(`\n✓ Total playbooks in database: ${totalCount}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyImport();
