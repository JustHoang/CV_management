const mongoose = require('mongoose');

const CVSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dob: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  github: { type: String },
  linkedin: { type: String },
  portfolio: { type: String },
  careerObjective: { type: String },
  education: [{
    school: String,
    major: String,
    startYear: String,
    endYear: String,
    gpa: String,
    highlights: [String],
  }],
  technicalSkills: [String],
  softSkills: [String],
  experience: [{
    company: String,
    position: String,
    start: String,
    end: String,
    technologies: [String],
    description: String,
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    role: String,
    github: String,
  }],
  certificates: [String],
  activities: [String],
  avatar: { type: String },
  summary: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CV', CVSchema);
