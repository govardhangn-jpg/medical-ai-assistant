const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientInfo: {
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    },
    patientId: {
      type: String,
      required: true
    }
  },
  clinicalData: {
    chiefComplaint: {
      type: String,
      required: true
    },
    historyOfPresentingIllness: {
      type: String,
      required: true
    },
    pastMedicalHistory: String,
    pastSurgicalHistory: String,
    currentMedications: [String],
    allergies: [String],
    familyHistory: String,
    socialHistory: String,
    examinationFindings: {
      vitals: {
        temperature: String,
        bloodPressure: String,
        heartRate: String,
        respiratoryRate: String,
        oxygenSaturation: String
      },
      generalExamination: String,
      systemicExamination: String
    },
    investigationResults: String
  },
  aiAnalysis: {
    clinicalAssessment: String,
    differentialDiagnosis: [{
      diagnosis: String,
      probability: {
  type: String,
  enum: ['High', 'Moderate', 'Low', 'Not specified'],
  default: 'Not Moderate'
},
      supportingFeatures: [String],
      investigationsNeeded: [String]
    }],
    recommendedInvestigations: {
      essential: [String],
      additional: [String]
    },
    treatmentPlan: {
      immediateManagement: String,
      pharmacological: [String],
      nonPharmacological: [String],
      monitoring: [String]
    },
    patientCounseling: [String],
    redFlags: [String],
    fullResponse: String // Store the complete AI response
  },
  status: {
    type: String,
    enum: ['draft', 'analyzed', 'reviewed', 'archived'],
    default: 'draft'
  },
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Index for faster queries
caseSchema.index({ doctor: 1, createdAt: -1 });
caseSchema.index({ 'patientInfo.patientId': 1 });
caseSchema.index({ status: 1 });

module.exports = mongoose.model('Case', caseSchema);
