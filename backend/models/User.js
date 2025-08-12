const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'employer', 'candidate'], default: 'candidate' },
  createdAt: { type: Date, default: Date.now },
  // Thông tin công ty cho nhà tuyển dụng
  companyName: { type: String },
  companyAddress: { type: String },
  companyWebsite: { type: String },
  companyDescription: { type: String },
  companyLogo: { type: String },

  // Thông tin riêng cho ứng viên
  avatar: { type: String },
  dob: { type: String },
  gender: { type: String },
  address: { type: String },
  phone: { type: String },
});

module.exports = mongoose.model('User', userSchema);
