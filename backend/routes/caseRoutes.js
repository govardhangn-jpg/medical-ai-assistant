const express = require('express');
const { body, validationResult } = require('express-validator');
const Case = require('../models/Case');
const aiService = require('../services/aiService');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/cases/analyze
 * @desc    Analyze a new medical case with AI
 * @access  Private
 */
router.post('/analyze', [
  body('patientInfo.age').isInt({ min: 0, max: 150 }).withMessage('Valid age is required'),
  body('patientInfo.gender').isIn(['Male', 'Female', 'Other']).withMessage('Valid gender is required'),
  body('patientInfo.patientId').trim().notEmpty().withMessage('Patient ID is required'),
  body('clinicalData.chiefComplaint').trim().notEmpty().withMessage('Chief complaint is required'),
  body('clinicalData.historyOfPresentingIllness').trim().notEmpty().withMessage('History of presenting illness is required'),
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const caseData = req.body;
    caseData.doctor = req.userId;

    // Get AI analysis
    const aiResult = await aiService.analyzeCaseWithClaude(caseData);

    if (!aiResult.success) {
      return res.status(500).json({ 
        error: 'AI analysis failed',
        details: aiResult.error 
      });
    }

    // Create new case with AI analysis
    const newCase = new Case({
      doctor: req.userId,
      patientInfo: caseData.patientInfo,
      clinicalData: caseData.clinicalData,
      aiAnalysis: aiResult.data,
      status: 'analyzed'
    });

    await newCase.save();

    res.status(201).json({
      message: 'Case analyzed successfully',
      case: newCase
    });
  } catch (error) {
    console.error('Case analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze case' });
  }
});

/**
 * @route   GET /api/cases
 * @desc    Get all cases for the logged-in doctor
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    
    const query = { doctor: req.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { 'patientInfo.patientId': { $regex: search, $options: 'i' } },
        { 'clinicalData.chiefComplaint': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [cases, total] = await Promise.all([
      Case.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-aiAnalysis.fullResponse'), // Exclude full response for list view
      Case.countDocuments(query)
    ]);

    res.json({
      cases,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Cases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

/**
 * @route   GET /api/cases/:id
 * @desc    Get a specific case by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.id,
      doctor: req.userId
    });

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ case: caseData });
  } catch (error) {
    console.error('Case fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

/**
 * @route   PUT /api/cases/:id
 * @desc    Update a case (add notes, change status, etc.)
 * @access  Private
 */
router.put('/:id', [
  body('notes').optional().trim(),
  body('status').optional().isIn(['draft', 'analyzed', 'reviewed', 'archived']),
  body('tags').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notes, status, tags } = req.body;
    const updateData = {};
    
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;
    if (tags) updateData.tags = tags;

    const caseData = await Case.findOneAndUpdate(
      { _id: req.params.id, doctor: req.userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ 
      message: 'Case updated successfully',
      case: caseData 
    });
  } catch (error) {
    console.error('Case update error:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

/**
 * @route   DELETE /api/cases/:id
 * @desc    Delete a case
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const caseData = await Case.findOneAndDelete({
      _id: req.params.id,
      doctor: req.userId
    });

    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    console.error('Case deletion error:', error);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

/**
 * @route   GET /api/cases/patient/:patientId
 * @desc    Get all cases for a specific patient
 * @access  Private
 */
router.get('/patient/:patientId', async (req, res) => {
  try {
    const cases = await Case.find({
      'patientInfo.patientId': req.params.patientId,
      doctor: req.userId
    })
    .sort({ createdAt: -1 })
    .select('-aiAnalysis.fullResponse');

    res.json({ cases, count: cases.length });
  } catch (error) {
    console.error('Patient cases fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch patient cases' });
  }
});

module.exports = router;
