require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const { authMiddleware, authorizeRoles } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());


// Static serve for uploaded logos
const path = require('path');
app.use('/uploads/logo', express.static(path.join(__dirname, 'uploads/logo')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/cv', require('./routes/cv'));
app.use('/api/job', require('./routes/job'));
app.use('/api/user', require('./routes/user'));
app.use('/api/upload', require('./routes/upload'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI ;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Example protected route
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Example admin-only route
app.get('/api/admin', authMiddleware, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Admin only route' });
});

app.get('/', (req, res) => {
  res.send('CV Management API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
