import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseAPI } from '../services/api';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const NewCase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    patientInfo: {
      age: '',
      gender: '',
      patientId: ''
    },
    clinicalData: {
      chiefComplaint: '',
      historyOfPresentingIllness: '',
      pastMedicalHistory: '',
      pastSurgicalHistory: '',
      currentMedications: '',
      allergies: '',
      familyHistory: '',
      socialHistory: '',
      examinationFindings: {
        vitals: {
          temperature: '',
          bloodPressure: '',
          heartRate: '',
          respiratoryRate: '',
          oxygenSaturation: ''
        },
        generalExamination: '',
        systemicExamination: ''
      },
      investigationResults: ''
    }
  });

  const handleChange = (section, field, value) => {
    if (section === 'patientInfo') {
      setFormData({
        ...formData,
        patientInfo: {
          ...formData.patientInfo,
          [field]: value
        }
      });
    } else if (section === 'vitals') {
      setFormData({
        ...formData,
        clinicalData: {
          ...formData.clinicalData,
          examinationFindings: {
            ...formData.clinicalData.examinationFindings,
            vitals: {
              ...formData.clinicalData.examinationFindings.vitals,
              [field]: value
            }
          }
        }
      });
    } else if (section === 'examination') {
      setFormData({
        ...formData,
        clinicalData: {
          ...formData.clinicalData,
          examinationFindings: {
            ...formData.clinicalData.examinationFindings,
            [field]: value
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        clinicalData: {
          ...formData.clinicalData,
          [field]: value
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert comma-separated strings to arrays
      const processedData = {
        ...formData,
        clinicalData: {
          ...formData.clinicalData,
          currentMedications: formData.clinicalData.currentMedications
            ? formData.clinicalData.currentMedications.split(',').map(m => m.trim())
            : [],
          allergies: formData.clinicalData.allergies
            ? formData.clinicalData.allergies.split(',').map(a => a.trim())
            : []
        }
      };

      const response = await caseAPI.analyzeCase(processedData);
      
      // Navigate to the case view
      navigate(`/cases/${response.data.case._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze case');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          New Case Analysis
        </h1>
        <p className="text-gray-600">
          Enter patient information to get AI-powered clinical decision support
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Patient ID *</label>
              <input
                type="text"
                value={formData.patientInfo.patientId}
                onChange={(e) => handleChange('patientInfo', 'patientId', e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Age *</label>
              <input
                type="number"
                value={formData.patientInfo.age}
                onChange={(e) => handleChange('patientInfo', 'age', e.target.value)}
                className="input-field"
                min="0"
                max="150"
                required
              />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select
                value={formData.patientInfo.gender}
                onChange={(e) => handleChange('patientInfo', 'gender', e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chief Complaint *</h2>
          <textarea
            value={formData.clinicalData.chiefComplaint}
            onChange={(e) => handleChange('clinical', 'chiefComplaint', e.target.value)}
            className="input-field"
            rows="2"
            placeholder="e.g., Chest pain for 2 hours"
            required
          />
        </div>

        {/* History */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">History</h2>
          <div className="space-y-4">
            <div>
              <label className="label">History of Presenting Illness *</label>
              <textarea
                value={formData.clinicalData.historyOfPresentingIllness}
                onChange={(e) => handleChange('clinical', 'historyOfPresentingIllness', e.target.value)}
                className="input-field"
                rows="4"
                placeholder="Detailed history of present complaint including onset, duration, character, aggravating/relieving factors..."
                required
              />
            </div>
            <div>
              <label className="label">Past Medical History</label>
              <textarea
                value={formData.clinicalData.pastMedicalHistory}
                onChange={(e) => handleChange('clinical', 'pastMedicalHistory', e.target.value)}
                className="input-field"
                rows="2"
                placeholder="Previous illnesses, chronic conditions..."
              />
            </div>
            <div>
              <label className="label">Past Surgical History</label>
              <textarea
                value={formData.clinicalData.pastSurgicalHistory}
                onChange={(e) => handleChange('clinical', 'pastSurgicalHistory', e.target.value)}
                className="input-field"
                rows="2"
                placeholder="Previous surgeries..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Current Medications</label>
                <input
                  type="text"
                  value={formData.clinicalData.currentMedications}
                  onChange={(e) => handleChange('clinical', 'currentMedications', e.target.value)}
                  className="input-field"
                  placeholder="Comma-separated (e.g., Aspirin 100mg, Metformin 500mg)"
                />
              </div>
              <div>
                <label className="label">Allergies</label>
                <input
                  type="text"
                  value={formData.clinicalData.allergies}
                  onChange={(e) => handleChange('clinical', 'allergies', e.target.value)}
                  className="input-field"
                  placeholder="Comma-separated (e.g., Penicillin, Sulfa drugs)"
                />
              </div>
            </div>
            <div>
              <label className="label">Family History</label>
              <textarea
                value={formData.clinicalData.familyHistory}
                onChange={(e) => handleChange('clinical', 'familyHistory', e.target.value)}
                className="input-field"
                rows="2"
                placeholder="Relevant family medical history..."
              />
            </div>
            <div>
              <label className="label">Social History</label>
              <textarea
                value={formData.clinicalData.socialHistory}
                onChange={(e) => handleChange('clinical', 'socialHistory', e.target.value)}
                className="input-field"
                rows="2"
                placeholder="Smoking, alcohol, occupation, lifestyle..."
              />
            </div>
          </div>
        </div>

        {/* Examination Findings */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Examination Findings</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="label text-xs">Temperature</label>
                <input
                  type="text"
                  value={formData.clinicalData.examinationFindings.vitals.temperature}
                  onChange={(e) => handleChange('vitals', 'temperature', e.target.value)}
                  className="input-field"
                  placeholder="98.6°F"
                />
              </div>
              <div>
                <label className="label text-xs">BP</label>
                <input
                  type="text"
                  value={formData.clinicalData.examinationFindings.vitals.bloodPressure}
                  onChange={(e) => handleChange('vitals', 'bloodPressure', e.target.value)}
                  className="input-field"
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className="label text-xs">Heart Rate</label>
                <input
                  type="text"
                  value={formData.clinicalData.examinationFindings.vitals.heartRate}
                  onChange={(e) => handleChange('vitals', 'heartRate', e.target.value)}
                  className="input-field"
                  placeholder="72 bpm"
                />
              </div>
              <div>
                <label className="label text-xs">Resp. Rate</label>
                <input
                  type="text"
                  value={formData.clinicalData.examinationFindings.vitals.respiratoryRate}
                  onChange={(e) => handleChange('vitals', 'respiratoryRate', e.target.value)}
                  className="input-field"
                  placeholder="16/min"
                />
              </div>
              <div>
                <label className="label text-xs">SpO2</label>
                <input
                  type="text"
                  value={formData.clinicalData.examinationFindings.vitals.oxygenSaturation}
                  onChange={(e) => handleChange('vitals', 'oxygenSaturation', e.target.value)}
                  className="input-field"
                  placeholder="98%"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">General Examination</label>
              <textarea
                value={formData.clinicalData.examinationFindings.generalExamination}
                onChange={(e) => handleChange('examination', 'generalExamination', e.target.value)}
                className="input-field"
                rows="3"
                placeholder="General appearance, hydration status, pallor, icterus, cyanosis, edema..."
              />
            </div>
            <div>
              <label className="label">Systemic Examination</label>
              <textarea
                value={formData.clinicalData.examinationFindings.systemicExamination}
                onChange={(e) => handleChange('examination', 'systemicExamination', e.target.value)}
                className="input-field"
                rows="4"
                placeholder="CVS, RS, Abdomen, CNS findings..."
              />
            </div>
          </div>
        </div>

        {/* Investigation Results */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Investigation Results</h2>
          <textarea
            value={formData.clinicalData.investigationResults}
            onChange={(e) => handleChange('clinical', 'investigationResults', e.target.value)}
            className="input-field"
            rows="4"
            placeholder="Lab results, imaging findings, ECG, etc..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary px-8"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <Loader className="animate-spin mr-2" size={20} />
                Analyzing Case...
              </span>
            ) : (
              <span className="flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Analyze Case
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCase;
