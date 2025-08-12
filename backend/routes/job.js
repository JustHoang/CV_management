
const express = require('express');
const Job = require('../models/Job');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const Apply = require('../models/Apply');
const User = require('../models/User');

const router = express.Router();

// Xóa ứng tuyển (candidate tự hủy apply)
router.delete('/:id/apply', authMiddleware, authorizeRoles('candidate'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;
    const apply = await Apply.findOneAndDelete({ user: userId, job: jobId });
    if (!apply) return res.status(404).json({ message: 'Không tìm thấy ứng tuyển để xóa.' });
    res.json({ message: 'Đã hủy ứng tuyển.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Lấy danh sách ứng viên đã ứng tuyển vào các job của employer
router.get('/applied/candidates', authMiddleware, authorizeRoles('employer'), async (req, res) => {
  try {
    // Lấy tất cả job của employer
    const jobs = await Job.find({ employer: req.user.userId });
    const jobIds = jobs.map(j => j._id);
    // Lấy tất cả apply vào các job này
    const applies = await Apply.find({ job: { $in: jobIds } })
      .populate({ path: 'user', select: 'username email avatar' })
      .populate({ path: 'job', select: 'title' });
    // Gom nhóm theo job
    const result = {};
    for (const a of applies) {
      const jobId = a.job?._id;
      if (!jobId) continue;
      if (!result[jobId]) result[jobId] = { job: a.job, candidates: [] };
      result[jobId].candidates.push({
        _id: a.user?._id,
        username: a.user?.username,
        email: a.user?.email,
        avatar: a.user?.avatar,
        appliedAt: a.createdAt
      });
    }
    res.json(Object.values(result));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create job post (employer only)
router.post('/', authMiddleware, authorizeRoles('employer'), async (req, res) => {
  try {
    const job = new Job({ ...req.body, employer: req.user.userId });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all job posts (public)
// Lọc jobs theo các trường dropdown
router.get('/', async (req, res) => {
  try {
  const { title, salary, experienceLevel, jobType, skills, limit, page, pageSize } = req.query;
    const filter = { isActive: true };
    if (title) {
      // Nếu là giá trị dropdown, lọc chính xác, nếu là text, dùng regex
      if (["dev","tester","manager","designer"].includes(title)) {
        filter.title = new RegExp(title, 'i');
      } else {
        filter.title = { $regex: title, $options: 'i' };
      }
    }
    if (salary) {
      if (salary === '5') filter.salary = /[0-4]\s*tr/i;
      else if (salary === '10') filter.salary = /5-10\s*tr/i;
      else if (salary === '20') filter.salary = /10-20\s*tr/i;
      else if (salary === '21') filter.salary = /(trên|>\s*20|21\+?)/i;
    }
    if (experienceLevel) {
      if (experienceLevel === '0') filter.experienceLevel = /chưa|0/i;
      else if (experienceLevel === '1') filter.experienceLevel = /1\s*năm/i;
      else if (experienceLevel === '2') filter.experienceLevel = /2\s*năm/i;
      else if (experienceLevel === '3') filter.experienceLevel = /3\+|trên\s*3/i;
    }
    if (jobType) {
      if (["fulltime","parttime","remote","intern"].includes(jobType)) {
        filter.jobType = new RegExp(jobType, 'i');
      }
    }
    if (skills) {
      // skills là chuỗi, có thể là nhiều kỹ năng cách nhau bởi dấu phẩy
      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArr.length > 0) {
        filter.tags = { $in: skillsArr };
      }
    }
  let jobs = await Job.find(filter).populate('employer', 'username email companyName');
    // Nếu có skills, sắp xếp theo số lượng tag trùng khớp và chỉ lấy tối đa 10 job phù hợp nhất
    if (skills) {
      const skillsArr = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      jobs = jobs
        .map(job => {
          const jobTags = (job.tags || []).map(t => t.toLowerCase());
          // Đếm số tag trùng với skills
          const matchCount = skillsArr.filter(skill => jobTags.includes(skill)).length;
          return { job, matchCount };
        })
        .filter(j => j.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount)
        .slice(0, limit ? parseInt(limit) : 10)
        .map(j => j.job);
    } else if (limit) {
      jobs = jobs.slice(0, parseInt(limit));
    }
    // Phân trang cho tất cả trường hợp (kể cả đã lọc theo skills hay chưa)
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const size = parseInt(pageSize) > 0 ? parseInt(pageSize) : 12;
    const total = jobs.length;
    const paged = jobs.slice((pageNum - 1) * size, pageNum * size);
    res.json({ data: paged, total, page: pageNum, pageSize: size });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my job posts (employer)
router.get('/my', authMiddleware, authorizeRoles('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.userId });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get job by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'username email companyName');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update job post (employer only)
router.put('/:id', authMiddleware, authorizeRoles('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(job, req.body, { updatedAt: new Date() });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete job post (employer only)
router.delete('/:id', authMiddleware, authorizeRoles('employer'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.employer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Ứng viên apply vào job
router.post('/:id/apply', authMiddleware, authorizeRoles('candidate'), async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.userId;
    // Kiểm tra đã apply chưa
    const existed = await Apply.findOne({ user: userId, job: jobId });
    if (existed) return res.status(400).json({ message: 'Bạn đã ứng tuyển công việc này rồi.' });
    const apply = new Apply({ user: userId, job: jobId });
    await apply.save();
    res.json({ message: 'Ứng tuyển thành công!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Lấy danh sách công ty đã ứng tuyển cho ứng viên
// Trả về tất cả các job đã ứng tuyển (không gộp theo công ty)
router.get('/applied/companies', authMiddleware, authorizeRoles('candidate'), async (req, res) => {
  try {
    // Populate sâu hơn để chắc chắn employer là object đầy đủ
    const applies = await Apply.find({ user: req.user.userId })
      .populate({
        path: 'job',
        populate: {
          path: 'employer',
          model: 'User',
          select: 'companyName companyLogo email _id'
        }
      });
    const jobs = applies
      .filter(a => a.job && a.job.employer && typeof a.job.employer === 'object')
      .map(a => ({
        jobId: a.job._id,
        jobTitle: a.job.title,
        company: {
          _id: a.job.employer._id,
          companyName: a.job.employer.companyName || '',
          companyLogo: a.job.employer.companyLogo || '',
          email: a.job.employer.email || ''
        },
        appliedAt: a.createdAt
      }));
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
