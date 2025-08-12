// Script tạo 100 bài tuyển dụng và 100 CV mẫu
// Chạy: node seedData.js

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Job = require('./models/Job');
const User = require('./models/User');
const CV = require('./models/CV');

const MONGO_URI = 'mongodb+srv://cvuse:hoangcute123@cluster0.b5bdki8.mongodb.net/cv_management?retryWrites=true&w=majority&appName=Cluster0'; 

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Đã kết nối MongoDB');

  // Lấy 1 employer và 1 candidate mẫu
  let employer = await User.findOne({ role: 'employer' });
  let candidate = await User.findOne({ role: 'candidate' });
  if (!employer) employer = await User.create({ username: 'employer1', password: '123456', role: 'employer', email: 'employer1@mail.com', companyName: 'Công ty A' });
  if (!candidate) candidate = await User.create({ username: 'candidate1', password: '123456', role: 'candidate', email: 'candidate1@mail.com' });

  // Tạo 100 job
  const jobTypes = ['Fulltime', 'Parttime', 'Remote', 'Intern'];
  const expLevels = ['0-1 năm', '1-2 năm', '2-3 năm', 'Trên 3 năm'];
  const tagsList = ['React', 'Node.js', 'Java', 'Python', 'SQL', 'AWS', 'Docker', 'Figma', 'C#', 'PHP'];
  const jobs = [];
  for (let i = 0; i < 100; i++) {
    jobs.push({
      employer: employer._id,
  title: faker.person.jobTitle(),
      description: faker.lorem.sentences(3),
      requirements: faker.lorem.sentences(2),
  location: faker.location.city(),
  salary: `${faker.number.int({ min: 5, max: 30 })} triệu`,
      deadline: faker.date.future(),
  contact: faker.phone.number(),
      benefits: faker.lorem.sentence(),
  jobType: faker.helpers.arrayElement(jobTypes),
  experienceLevel: faker.helpers.arrayElement(expLevels),
  tags: faker.helpers.arrayElements(tagsList, faker.number.int({ min: 2, max: 5 })),
      isActive: true,
    });
  }
  await Job.insertMany(jobs);
  console.log('Đã tạo 100 bài tuyển dụng');

  // Tạo 100 CV
  const skillsList = ['React', 'Node.js', 'Java', 'Python', 'SQL', 'AWS', 'Docker', 'Figma', 'C#', 'PHP'];
  const cvs = [];
  for (let i = 0; i < 100; i++) {
    cvs.push({
      user: candidate._id,
  name: faker.person.fullName(),
      email: faker.internet.email(),
  phone: faker.phone.number(),
  address: faker.location.streetAddress(),
  gender: faker.helpers.arrayElement(['Nam', 'Nữ', 'Khác']),
      dob: faker.date.past(30, new Date('2000-01-01')),
      avatar: faker.image.avatar(),
  skills: faker.helpers.arrayElements(skillsList, faker.number.int({ min: 2, max: 5 })),
      summary: faker.lorem.sentence(),
      education: [{
        degree: 'Cử nhân',
  school: faker.company.name(),
  startYear: faker.number.int({ min: 2010, max: 2018 }),
  endYear: faker.number.int({ min: 2019, max: 2024 }),
        field: faker.name.jobArea(),
      }],
      experience: [{
        position: faker.name.jobTitle(),
  company: faker.company.name(),
        startDate: faker.date.past(5),
        endDate: faker.date.recent(),
        description: faker.lorem.sentence(),
      }],
      projects: [{
        name: faker.commerce.productName(),
        description: faker.lorem.sentence(),
        link: faker.internet.url(),
      }],
      certifications: [],
      languages: [{ name: 'English', level: 'Intermediate' }],
      interests: [faker.hacker.noun()],
      references: [],
      awards: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await CV.insertMany(cvs);
  console.log('Đã tạo 100 CV');

  await mongoose.disconnect();
  console.log('Done!');
}

seed();
