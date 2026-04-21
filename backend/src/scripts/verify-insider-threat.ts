import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

const verifyInsiderThreatPlaybook = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const playbook = await Playbook.findOne({
      where: {
        name: 'Insider Threat Response'
      }
    });

    if (!playbook) {
      console.log('❌ Insider Threat Response playbook not found!');
      process.exit(1);
    }

    console.log('\n✓ Playbook found: Insider Threat Response');
    console.log(`  Description: ${playbook.description?.substring(0, 100)}...`);
    console.log(`  Incident Type: ${playbook.incidentType}`);
    console.log(`  Status: ${playbook.status}`);

    const phases = playbook.phases as any[];
    console.log(`\n  Phases: ${phases.length}`);
    
    let totalTasks = 0;
    let totalSubtasks = 0;
    
    phases.forEach((phase: any, index: number) => {
      const tasks = phase.tasks || [];
      const taskCount = tasks.length;
      totalTasks += taskCount;
      
      console.log(`\n  Phase ${index + 1}: ${phase.name}`);
      console.log(`    Tasks: ${taskCount}`);
      
      tasks.slice(0, 3).forEach((task: any, taskIndex: number) => {
        const subtasks = task.subtasks || [];
        totalSubtasks += subtasks.length;
        console.log(`      ${taskIndex + 1}. ${task.title} (${task.complexity}, ${subtasks.length} subtasks)`);
      });
      
      if (taskCount > 3) {
        console.log(`      ... and ${taskCount - 3} more tasks`);
        tasks.slice(3).forEach((task: any) => {
          totalSubtasks += (task.subtasks || []).length;
        });
      }
    });

    console.log(`\n✅ Summary:`);
    console.log(`   Total Phases: ${phases.length}`);
    console.log(`   Total Tasks: ${totalTasks}`);
    console.log(`   Total Subtasks: ${totalSubtasks}`);
    
    const sampleTask = phases[0]?.tasks?.[0];
    if (sampleTask) {
      console.log(`\n✓ Sample Task Structure:`);
      console.log(`   Title: ${sampleTask.title}`);
      console.log(`   Content: ${sampleTask.content ? 'Yes' : 'No'}`);
      console.log(`   Task Type: ${sampleTask.taskType || 'N/A'}`);
      console.log(`   Complexity: ${sampleTask.complexity || 'N/A'}`);
      console.log(`   Work Role: ${sampleTask.preferredWorkRole || 'N/A'}`);
      console.log(`   Outcomes: ${(sampleTask.outcomes || []).length}`);
      console.log(`   Subtasks: ${(sampleTask.subtasks || []).length}`);
    }
    
    const count = await Playbook.count();
    console.log(`\n✓ Total playbooks in database: ${count}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

verifyInsiderThreatPlaybook();
