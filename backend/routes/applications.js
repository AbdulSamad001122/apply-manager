import express from 'express';
const router = express.Router();
import Application from '../models/Application.js';

// Get all applications
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new application
router.post('/', async (req, res) => {
  const application = new Application({
    name: req.body.name,
    email: req.body.email,
    postLink: req.body.postLink,
    accountLink: req.body.accountLink,
  });

  try {
    const newApplication = await application.save();
    res.status(201).json(newApplication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an application
router.put('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (req.body.name != null) application.name = req.body.name;
    if (req.body.email != null) application.email = req.body.email;
    if (req.body.postLink != null) application.postLink = req.body.postLink;
    if (req.body.accountLink != null) application.accountLink = req.body.accountLink;

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an application
router.delete('/:id', async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
