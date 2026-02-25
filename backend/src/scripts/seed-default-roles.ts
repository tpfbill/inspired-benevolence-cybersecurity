import { sequelize } from '../database/connection';
import Role from '../models/Role';

const defaultRoles = [
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Full system access - can manage everything including users and system settings',
    permissions: [
      'manage_users',
      'manage_roles',
      'manage_playbooks',
      'manage_incidents',
      'manage_alerts',
      'view_compliance',
      'manage_settings'
    ],
    color: '#9333EA',
    isSystem: false
  },
  {
    name: 'Security Analyst',
    slug: 'security_analyst',
    description: 'Incident management and playbook creation - primary incident responders',
    permissions: [
      'create_incidents',
      'edit_incidents',
      'view_incidents',
      'create_playbooks',
      'edit_playbooks',
      'view_playbooks',
      'manage_alerts',
      'view_compliance'
    ],
    color: '#DC2626',
    isSystem: false
  },
  {
    name: 'IT Director',
    slug: 'it_director',
    description: 'System management and technical response - infrastructure and technical operations',
    permissions: [
      'view_incidents',
      'edit_incidents',
      'view_playbooks',
      'manage_alerts',
      'view_compliance'
    ],
    color: '#2563EB',
    isSystem: false
  },
  {
    name: 'Legal',
    slug: 'legal',
    description: 'Compliance, notifications, and legal review - regulatory and legal matters',
    permissions: [
      'view_incidents',
      'edit_incidents',
      'view_playbooks',
      'view_compliance',
      'manage_notifications'
    ],
    color: '#D97706',
    isSystem: false
  },
  {
    name: 'HR',
    slug: 'hr',
    description: 'Employee communications and insider threats - personnel-related incidents',
    permissions: [
      'view_incidents',
      'edit_incidents',
      'view_playbooks',
      'manage_communications'
    ],
    color: '#16A34A',
    isSystem: false
  },
  {
    name: 'Executive',
    slug: 'executive',
    description: 'Strategic oversight and decision-making - high-level visibility and approvals',
    permissions: [
      'view_incidents',
      'view_playbooks',
      'view_compliance',
      'view_reports',
      'approve_decisions'
    ],
    color: '#1F2937',
    isSystem: false
  },
  {
    name: 'Viewer',
    slug: 'viewer',
    description: 'Read-only access - can view but not modify anything',
    permissions: [
      'view_incidents',
      'view_playbooks',
      'view_alerts'
    ],
    color: '#6B7280',
    isSystem: false
  }
];

async function seedDefaultRoles() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Sync the roles table
    await Role.sync({ alter: true });
    console.log('Roles table synchronized');

    console.log(`\nSeeding ${defaultRoles.length} default roles...`);

    let created = 0;
    let updated = 0;

    for (const roleData of defaultRoles) {
      const existing = await Role.findOne({ where: { slug: roleData.slug } });

      if (existing) {
        // Update existing role
        await existing.update(roleData);
        console.log(`✓ Updated: ${roleData.name} (${roleData.permissions.length} permissions)`);
        updated++;
      } else {
        // Create new role
        await Role.create(roleData);
        console.log(`✓ Created: ${roleData.name} (${roleData.permissions.length} permissions)`);
        created++;
      }
    }

    console.log(`\n✅ Default roles seeding complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    
    const totalRoles = await Role.count();
    console.log(`   Total roles in database: ${totalRoles}`);
    
    console.log(`\n📋 Available Permissions:`);
    const allPermissions = new Set<string>();
    defaultRoles.forEach(role => role.permissions.forEach(p => allPermissions.add(p)));
    Array.from(allPermissions).sort().forEach(p => console.log(`   - ${p}`));
    
    console.log(`\n💡 All roles are now fully editable and deletable!`);
    console.log(`   You can modify any role's name, permissions, or color.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding default roles:', error);
    process.exit(1);
  }
}

seedDefaultRoles();
