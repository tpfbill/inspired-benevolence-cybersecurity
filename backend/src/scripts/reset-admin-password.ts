import { sequelize } from '../database/connection';
import User from '../models/User';

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const admin = await User.findOne({ 
      where: { email: 'admin@inspiredbenevolence.com' } 
    });

    if (!admin) {
      console.log('❌ Admin user not found. Creating new admin...');
      
      const newAdmin = await User.create({
        email: 'admin@inspiredbenevolence.com',
        password: 'Password123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ New admin user created!');
      console.log(`   Email: ${newAdmin.email}`);
      console.log(`   Password: Password123!`);
    } else {
      console.log('Found admin user:', admin.email);
      
      // Update password
      admin.password = 'Password123!';
      await admin.save();
      
      console.log('✅ Admin password reset successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: Password123!`);
    }
    
    console.log('\n🔐 You can now login at http://localhost:3000');
    
    process.exit(0);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
}

resetAdminPassword();
