import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';
import User from '../models/User';
import playbookTemplates from '../data/playbook-templates.json';

async function importPlaybooks() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Find the admin user to assign as creator
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.email}`);
    console.log(`Importing ${playbookTemplates.length} playbook templates...`);

    for (const template of playbookTemplates) {
      // Check if playbook already exists
      const existing = await Playbook.findOne({
        where: { name: template.name }
      });

      if (existing) {
        console.log(`✓ Playbook "${template.name}" already exists, skipping...`);
        continue;
      }

      // Create the playbook - support both phases and legacy steps format
      const playbookData: any = {
        name: template.name,
        incidentType: template.incidentType,
        description: template.description,
        framework: template.framework,
        tags: template.tags,
        createdBy: adminUser.id,
        status: 'active' // Make templates active by default
      };

      // Add phases if present (new format)
      if (template.phases && template.phases.length > 0) {
        playbookData.phases = template.phases;
        playbookData.steps = template.steps || []; // Keep empty steps for compatibility
      } else {
        // Legacy format - only has steps
        playbookData.steps = template.steps || [];
        playbookData.phases = [];
      }

      const playbook = await Playbook.create(playbookData);

      // Log appropriate count message
      if (playbookData.phases.length > 0) {
        const taskCount = playbookData.phases.reduce((sum: number, phase: any) => sum + (phase.tasks?.length || 0), 0);
        console.log(`✓ Imported: ${playbook.name} (${playbookData.phases.length} phases, ${taskCount} tasks)`);
      } else {
        console.log(`✓ Imported: ${playbook.name} (${playbook.steps.length} steps)`);
      }
    }

    console.log('\n✅ Playbook import complete!');
    console.log(`Total playbooks in database: ${await Playbook.count()}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error importing playbooks:', error);
    process.exit(1);
  }
}

importPlaybooks();
