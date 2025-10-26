const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/User'); // Ensure the path is correct

dotenv.config();

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);

        console.log('Connected to MongoDB.');

        const adminEmail = 'admin@admin.com'; // Change if needed
        const adminPassword = 'admin@123'; // Change or generate securely

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists.');
        } else {
            // Hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            // Create admin user
            const adminUser = new User({
                fullname: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'Admin',
                status: 'Active'
            });

            await adminUser.save();
            console.log('Admin user created successfully.');
        }

        // Close connection
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding admin:', error);
        mongoose.connection.close();
    }
};

// Run the seeding function
seedAdmin();
