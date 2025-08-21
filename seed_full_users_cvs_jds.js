const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const uri = 'mongodb+srv://cvuse:hoangcute123@cluster0.b5bdki8.mongodb.net/cv_management?retryWrites=true&w=majority&appName=Cluster0';

const candidateCount = 10;
const employerCount = 10;
const cvPerCandidate = 10;
const jdPerEmployer = 10;

const userSchema = new mongoose.Schema({}, { strict: false });
const cvSchema = new mongoose.Schema({}, { strict: false });
const jobSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');
const CV = mongoose.model('CV', cvSchema, 'cvs');
const Job = mongoose.model('Job', jobSchema, 'jobs');

function randomArray(fn, min, max) {
  const n = faker.number.int({ min, max });
  return Array.from({ length: n }, fn);
}

async function fakeUser(role = 'candidate') {
  const password = await bcrypt.hash('123456', 10);
  return {
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password,
    role,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 })
  };
}

function fakeCV(userId) {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    gender: faker.helpers.arrayElement(['Nam', 'Nữ', 'Khác']),
    dob: faker.date.past({ years: 30, refDate: '2002-01-01' }).toISOString().slice(0, 10),
    avatar: faker.image.avatar(),
    skills: randomArray(() => faker.hacker.ingverb(), 4, 8),
    summary: faker.lorem.sentences(2),
    website: faker.internet.url(),
    education: randomArray(() => ({
      school: faker.company.name(),
      degree: faker.helpers.arrayElement(['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ']),
      field: faker.person.jobArea(),
      startYear: faker.number.int({ min: 2010, max: 2020 }),
      endYear: faker.number.int({ min: 2021, max: 2025 })
    }), 1, 2),
    experience: randomArray(() => ({
      company: faker.company.name(),
      position: faker.person.jobTitle(),
      startDate: faker.date.past({ years: 10, refDate: '2020-01-01' }).toISOString().slice(0, 10),
      endDate: faker.date.recent({ days: 1000 }).toISOString().slice(0, 10),
      description: faker.lorem.sentence()
    }), 1, 3),
    projects: randomArray(() => ({
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      link: faker.internet.url()
    }), 1, 2),
    certifications: randomArray(() => ({
      name: faker.company.buzzNoun(),
      organization: faker.company.name(),
      year: faker.number.int({ min: 2015, max: 2025 })
    }), 0, 2),
    languages: randomArray(() => ({
      name: faker.helpers.arrayElement(['English', 'Japanese', 'Korean', 'French', 'German']),
      level: faker.helpers.arrayElement(['Basic', 'Intermediate', 'Advanced', 'Fluent'])
    }), 1, 2),
    interests: randomArray(() => faker.word.noun(), 2, 4),
    references: randomArray(() => ({
      name: faker.person.fullName(),
      contact: faker.phone.number(),
      relation: faker.person.jobType()
    }), 0, 2),
    awards: randomArray(() => ({
      name: faker.company.catchPhrase(),
      year: faker.number.int({ min: 2015, max: 2025 }),
      description: faker.lorem.sentence()
    }), 0, 2),
    user: userId,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 })
  };
}

function fakeJD(userId) {
  return {
    title: faker.person.jobTitle(),
    company: faker.company.name(),
    companyName: faker.company.name(),
    location: faker.location.city(),
    description: faker.lorem.paragraph(),
    tags: randomArray(() => faker.hacker.ingverb(), 4, 8),
    experienceLevel: faker.number.int({ min: 0, max: 10 }),
    education: faker.helpers.arrayElement(['Cử nhân', 'Kỹ sư', 'Thạc sĩ', 'Tiến sĩ']),
    salary: faker.number.int({ min: 10, max: 100 }) * 1000000,
    user: userId,
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 })
  };
}

async function seed() {
  await mongoose.connect(uri);
  await User.deleteMany({});
  await CV.deleteMany({});
  await Job.deleteMany({});
  // Tạo user candidate và employer cố định (hash password)
  const candidatePassword = await bcrypt.hash('candidate', 10);
  const employerPassword = await bcrypt.hash('employer', 10);
  const candidateUser = await User.create({
    username: 'candidate',
    email: 'candidate@gmail.com',
    password: candidatePassword,
    role: 'candidate',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const employerUser = await User.create({
    username: 'employer',
    email: 'employer@gmail.com',
    password: employerPassword,
    role: 'employer',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  // Tạo candidate ngẫu nhiên
  const candidates = [];
  for (let i = 0; i < candidateCount; i++) {
    candidates.push(await fakeUser('candidate'));
  }
  const insertedCandidates = await User.insertMany(candidates);
  // Tạo employer ngẫu nhiên
  const employers = [];
  for (let i = 0; i < employerCount; i++) {
    employers.push(await fakeUser('employer'));
  }
  const insertedEmployers = await User.insertMany(employers);
  // Tạo CV cho từng candidate (bao gồm cả user cố định)
  let cvs = [];
  const allCandidates = [candidateUser, ...insertedCandidates];
  for (const user of allCandidates) {
    cvs = cvs.concat(Array.from({ length: cvPerCandidate }, () => fakeCV(user._id)));
  }
  await CV.insertMany(cvs);
  // Tạo JD cho từng employer (bao gồm cả user cố định)
  let jds = [];
  const allEmployers = [employerUser, ...insertedEmployers];
  for (const user of allEmployers) {
    jds = jds.concat(Array.from({ length: jdPerEmployer }, () => fakeJD(user._id)));
  }
  await Job.insertMany(jds);
  console.log(`Đã seed ${allCandidates.length} candidate, ${allEmployers.length} employer, ${cvs.length} CV, ${jds.length} JD!`);
  process.exit();
}

seed().catch(err => { console.error(err); process.exit(1); });
