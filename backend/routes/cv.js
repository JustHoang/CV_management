const express = require('express');
const CV = require('../models/CV');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// API: Lấy 10 bài tuyển dụng phù hợp nhất cho một CV, có tính điểm so khớp
router.get('/job-match/:cvId', authMiddleware, async (req, res) => {
  try {
    const Job = require('../models/Job');
    const cv = await CV.findById(req.params.cvId);
    if (!cv) return res.status(404).json({ message: 'CV not found' });

    // Lấy tất cả bài tuyển dụng
    const jobs = await Job.find();

    // Hàm tính điểm so khớp
    function calculateJobMatchingScore(job, cv) {
      const jobSkills = job.tags || [];
      const cvSkills = cv.skills || [];
      const skillMatches = jobSkills.filter(skill => cvSkills.includes(skill));
      const skillScore = Math.min(skillMatches.length, 5);

      let experienceScore = 0;
      if (job.experienceLevel && cv.experience) {
        if (cv.experience >= job.experienceLevel) experienceScore = 2;
      }

      let locationScore = 0;
      if (job.location && cv.location && job.location === cv.location) locationScore = 2;

      let educationScore = 0;
      if (!job.education || (cv.education && cv.education === job.education)) educationScore = 1;

      return skillScore + experienceScore + locationScore + educationScore;
    }

    // Tính điểm và lọc
    const scoredJobs = jobs
      .map(job => ({
        ...job.toObject(),
        matchingScore: calculateJobMatchingScore(job, cv)
      }))
      .sort((a, b) => b.matchingScore - a.matchingScore)
      .slice(0, 10);

    res.json({ data: scoredJobs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// API: Lấy 10 CV phù hợp nhất cho một job, có tính điểm so khớp
router.get('/match/:jobId', authMiddleware, authorizeRoles('employer', 'admin'), async (req, res) => {
  try {
    const Job = require('../models/Job');
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Lấy tất cả CV ứng viên
    const cvs = await CV.find().populate({
      path: 'user',
      select: 'username email role',
      match: { role: 'candidate' }
    });

    // Hàm tính điểm so khớp
    function calculateMatchingScore(cv, job) {
      const jobSkills = job.tags || [];
      const cvSkills = cv.skills || [];
      const skillMatches = jobSkills.filter(skill => cvSkills.includes(skill));
      const skillScore = Math.min(skillMatches.length, 5);

      let experienceScore = 0;
      if (job.experienceLevel && cv.experience) {
        if (cv.experience >= job.experienceLevel) experienceScore = 2;
      }

      let locationScore = 0;
      if (job.location && cv.location && job.location === cv.location) locationScore = 2;

      let educationScore = 0;
      if (!job.education || (cv.education && cv.education === job.education)) educationScore = 1;

      return skillScore + experienceScore + locationScore + educationScore;
    }

    // Tính điểm và lọc
    const scoredCVs = cvs
      .filter(cv => cv.user) // chỉ lấy CV có user là candidate
      .map(cv => ({
        ...cv.toObject(),
        matchingScore: calculateMatchingScore(cv, job)
      }))
      .sort((a, b) => b.matchingScore - a.matchingScore)
      .slice(0, 10);

    res.json({ data: scoredCVs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create CV
router.post('/', authMiddleware, async (req, res) => {
  try {
    const cv = new CV({ ...req.body, user: req.user.userId });
    await cv.save();
    res.status(201).json(cv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Get all CVs (admin or employer)
router.get('/all', authMiddleware, authorizeRoles('admin', 'employer'), async (req, res) => {
  try {
    // Phân trang
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const pageSize = parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : 12;

    // Xây dựng điều kiện lọc
    const filter = {};
    if (req.query.skills) {
      // Tìm CV có ít nhất 1 kỹ năng trùng với tags của job
      const skillsArr = Array.isArray(req.query.skills)
        ? req.query.skills
        : req.query.skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArr.length > 0) filter.skills = { $in: skillsArr };
    }
    

    // Chỉ lấy CV của user có role là candidate
    const cvs = await CV.find(filter).populate({
      path: 'user',
      select: 'username email role',
      match: { role: 'candidate' }
    });
    // Lọc bỏ các CV không có user (tức là không phải candidate)
    const filtered = cvs.filter(cv => cv.user);
    const total = filtered.length;
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
    res.json({ data: paged, total, page, pageSize });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my CVs (user)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    // Phân trang
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const pageSize = parseInt(req.query.pageSize) > 0 ? parseInt(req.query.pageSize) : 10;
    const allCVs = await CV.find({ user: req.user.userId });
    const total = allCVs.length;
    const paged = allCVs.slice((page - 1) * pageSize, page * pageSize);
    res.json({ data: paged, total, page, pageSize });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get CV by ID (owner or admin)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id).populate('user', 'username email role');
    if (!cv) return res.status(404).json({ message: 'CV not found' });
    if (cv.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(cv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update CV (owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) return res.status(404).json({ message: 'CV not found' });
    if (cv.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(cv, req.body, { updatedAt: new Date() });
    await cv.save();
    res.json(cv);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete CV (owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id);
    if (!cv) return res.status(404).json({ message: 'CV not found' });
    if (cv.user.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await cv.deleteOne();
    res.json({ message: 'CV deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Get CV by userId (for employer/admin to view candidate CV)
// Cho phép candidate xem CV của chính mình, employer/admin xem bất kỳ CV nào
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Nếu là candidate, chỉ cho xem CV của chính mình
    if (req.user.role === 'candidate' && req.user.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  const cv = await CV.findOne({ user: req.params.userId });
  if (!cv) return res.status(404).json({ message: 'CV not found' });
  // Đảm bảo luôn trả về user là string
  const cvObj = cv.toObject();
  cvObj.user = cvObj.user?.toString?.() || cvObj.user;
  res.json(cvObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
