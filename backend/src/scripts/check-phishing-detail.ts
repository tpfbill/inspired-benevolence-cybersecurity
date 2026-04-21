import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const checkPhishing = async () => {
  try {
    await sequelize.authenticate();
    
    const phishing = await Playbook.findOne({
      where: {
        name: 'Phishing Attack Response'
      }
    });

    if (phishing) {
      console.log('Phishing Attack Response found:');
      console.log('Name:', phishing.name);
      console.log('Description:', phishing.description);
      console.log('\nHas phases?', !!phishing.phases);
      console.log('Has steps?', !!phishing.steps);
      
      if (phishing.phases) {
        console.log('\nPhases:', phishing.phases.length);
        phishing.phases.forEach((phase: any, i: number) => {
          console.log(`\nPhase ${i + 1}: ${phase.phase}`);
          console.log(`  Tasks: ${phase.tasks ? phase.tasks.length : 0}`);
          if (phase.tasks && phase.tasks[0]) {
            console.log(`  First task: ${phase.tasks[0].title}`);
            console.log(`  Has subtasks: ${phase.tasks[0].subtasks ? phase.tasks[0].subtasks.length : 0}`);
          }
        });
      }
      
      if (phishing.steps) {
        console.log('\nSteps (legacy format):', phishing.steps.length);
        if (phishing.steps[0]) {
          console.log('First step:', phishing.steps[0].title);
        }
      }
    } else {
      console.log('Phishing Attack Response NOT found in database!');
    }
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPhishing();
