const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const createGuestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if guest user already exists
        const existingGuest = await User.findOne({ email: 'guest@sustainhub.com' });
        
        if (existingGuest) {
            console.log('Guest user already exists');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Guestuser321@G', salt);

        // Create guest user
        const guestUser = new User({
            email: 'guest@sustainhub.com',
            password: hashedPassword,
            firstName: 'Guest',
            lastName: 'User',
            phone: '1234567890',
            address: 'Demo Address',
            role: 'user'
        });

        await guestUser.save();
        console.log('Guest user created successfully!');
        console.log('Email: guest@sustainhub.com');
        console.log('Password: Guestuser321@G');

    } catch (error) {
        console.error('Error creating guest user:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

createGuestUser();
