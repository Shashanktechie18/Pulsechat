const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

const DB_CONNECTION = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatapp';

async function addDemoUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(DB_CONNECTION);
        console.log('Connected to MongoDB');

        // Demo users data
        const demoUsers = [
            { username: 'rohith', email: 'rohith@demo.com', password: 'password123' },
            { username: 'ram', email: 'ram@demo.com', password: 'password123' },
            { username: 'krishna', email: 'krishna@demo.com', password: 'password123' },
            { username: 'kalyan', email: 'kalyan@demo.com', password: 'password123' }
        ];

        for (const userData of demoUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ username: userData.username });
            if (existingUser) {
                console.log(`User ${userData.username} already exists, skipping...`);
                continue;
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Create user
            const user = new User({
                username: userData.username,
                email: userData.email,
                passwordHash: hashedPassword,
                online: false,
                createdAt: new Date(),
                lastSeen: new Date()
            });

            await user.save();
            console.log(` Created demo user: ${userData.username}`);
        }

        console.log(' All demo users created successfully!');
        
    } catch (error) {
        console.error('Error creating demo users:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
addDemoUsers();