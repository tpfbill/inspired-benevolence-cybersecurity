import { sequelize } from '../database/connection';
import User from '../models/User';

async function updateAdminCredentials() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const admin = await User.findOne({ 
      where: { email: 'admin@example.com' } 
    });

    if (!admin) {
      console.log('❌ Admin user not found.');
      process.exit(1);
    }

    console.log('Found admin user:', admin.email);
    
    // Update password (will be hashed by the User model)
    admin.password = 'admin123';
    await admin.save();
    
    console.log('✅ Admin credentials updated successfully!');
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123`);
    console.log('\n🔐 You can now login at http://127.0.0.1:3012');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    process.exit(1);
  }
}

updateAdminCredentials();
