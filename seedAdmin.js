const dotenv =require('dotenv')
const bcrypt =require('bcrypt')
const connectDB =require('./src/config/db')
const User = require('./src/models/user.model')

dotenv.config()
const createAdmin = async ()=>{
    try {
        await connectDB()
        const adminEmail='admin@studentms.com'
        const adminPassword ='Admin@123456'
        const existingAdmin = await User.findOne({email:adminEmail})
        if(existingAdmin){
             console.log('Admin already exists');
      process.exit(0);
        }
        const hashedPassword = await bcrypt.hash(adminPassword,10)
        const admin = await User.create({
            firstName: 'Zeinab',
      lastName: 'Ahmed',
      age: 22,
      phone: '01000000000',
      address: 'Tanta, Gharbia, Egypt',

      email: adminEmail,
      password: hashedPassword,

      role: 'admin',
      status: 'active'
        })
        process.exit(0)
    } catch (error) {
        console.error('Error creating admin:', error.message);
    process.exit(1);
    }
    
}
createAdmin()