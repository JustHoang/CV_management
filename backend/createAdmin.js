const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const username = 'admin1';
  const email = 'admin1@example.com';
  const password = 'admin123';
  const role = 'admin';
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    console.log('Admin user already exists.');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, email, password: hashedPassword, role });
  await user.save();
  console.log('Admin user created:', { username, email, password, role });
  process.exit(0);
}

createAdmin();
