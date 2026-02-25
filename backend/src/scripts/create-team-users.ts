import { sequelize } from '../database/connection';
import User from '../models/User';

const teamMembers = [
  {
    email: 'sarah.chen@inspiredbenevolence.com',
    password: 'Password123!',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'security_analyst',
    department: 'Security Operations'
  },
  {
    email: 'mike.rodriguez@inspiredbenevolence.com',
    password: 'Password123!',
    firstName: 'Mike',
    lastName: 'Rodriguez',
    role: 'it_director',
    department: 'IT Operations'
  },
  {
    email: 'jennifer.kim@inspiredbenevolence.com',
    password: 'Password123!',
    firstName: 'Jennifer',
    lastName: 'Kim',
    role: 'legal',
    department: 'Legal & Compliance'
  },
  {
    email: 'david.thompson@inspiredbenevolence.com',
    password: 'Password123!',
    firstName: 'David',
    lastName: 'Thompson',
    role: 'hr',
    department: 'Human Resources'
  },
  {
    email: 'robert.jackson@inspiredbenevolence.com',
    password: 'Password123!',
    firstName: 'Robert',
    lastName: 'Jackson',
    role: 'executive',
    department: 'Executive Leadership'
  },
  {
    email: 'emily.parker@inspiredbenevolence.com',
    password: 'Password123!',
    firstName: 'Emily',
    lastName: 'Parker',
    role: 'security_analyst',
    department: 'Security Operations'
  }
];

async function createTeamUsers() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    console.log(`Creating ${teamMembers.length} team member accounts...`);

    let created = 0;
    let skipped = 0;

    for (const member of teamMembers) {
      const existing = await User.findOne({ where: { email: member.email } });

      if (existing) {
        console.log(`⊘ Skipped: ${member.firstName} ${member.lastName} (${member.email}) - already exists`);
        skipped++;
        continue;
      }

      await User.create(member);
      console.log(`✓ Created: ${member.firstName} ${member.lastName} - ${member.role.replace('_', ' ').toUpperCase()}`);
      created++;
    }

    console.log(`\n✅ Team user creation complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    
    const totalUsers = await User.count();
    console.log(`   Total users in database: ${totalUsers}`);
    
    // Show breakdown by role
    const adminCount = await User.count({ where: { role: 'admin' } });
    const analystCount = await User.count({ where: { role: 'security_analyst' } });
    const itCount = await User.count({ where: { role: 'it_director' } });
    const legalCount = await User.count({ where: { role: 'legal' } });
    const hrCount = await User.count({ where: { role: 'hr' } });
    const execCount = await User.count({ where: { role: 'executive' } });
    
    console.log(`\n👥 Users by Role:`);
    console.log(`   Admin: ${adminCount}`);
    console.log(`   Security Analysts: ${analystCount}`);
    console.log(`   IT Directors: ${itCount}`);
    console.log(`   Legal: ${legalCount}`);
    console.log(`   HR: ${hrCount}`);
    console.log(`   Executives: ${execCount}`);
    
    console.log(`\n💡 You can now assign these users to tasks!`);
    console.log(`   All users have password: Password123!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating team users:', error);
    process.exit(1);
  }
}

createTeamUsers();
