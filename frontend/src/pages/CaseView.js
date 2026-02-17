import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { caseAPI } from '../services/api';
import {
  ArrowLeft,
  User,
  Activity,
  FileText,
  TestTube,
  Pill,
  Heart,
  AlertTriangle,
  Download,
  Trash2
} from 'lucide-react';

const CaseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');



  const fetchCase = async () => {
    try {
      const response = await caseAPI.getCaseById(id);
      setCaseData(response.data.case);
      setLoading(false);
    } catch (err) {
      setError('Failed to load case');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        await caseAPI.deleteCase(id);
        navigate('/cases');
      } catch (err) {
        alert('Failed to delete case');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'Case not found'}</p>
        <button onClick={() => navigate('/cases')} className="btn-primary">
          Back to Cases
        </button>
      </div>
    );
  }

  const { patientInfo, clinicalData, aiAnalysis, createdAt, status } = caseData;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/cases')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Cases
        </button>
        <div className="flex space-x-2">
          <button onClick={handlePrint} className="btn-secondary flex items-center">
            <Download size={18} className="mr-2" />
            Export
          </button>
          <button onClick={handleDelete} className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="card mb-6 print:break-inside-avoid">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-primary-100 p-3 rounded-lg">
              <User className="text-primary-600" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Patient ID: {patientInfo.patientId}
              </h1>
              <p className="text-gray-600">
                {patientInfo.age} years • {patientInfo.gender}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {new Date(createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                status === 'analyzed'
                  ? 'bg-green-100 text-green-700'
                  : status === 'reviewed'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Chief Complaint</h3>
          <p className="text-gray-700">{clinicalData.chiefComplaint}</p>
        </div>
      </div>

      {/* Clinical Assessment */}
      <div className="card mb-6 print:break-inside-avoid">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Clinical Assessment</h2>
        </div>
        <p className="text-gray-700 whitespace-pre-line">{aiAnalysis.clinicalAssessment}</p>
      </div>

      {/* Differential Diagnosis */}
      <div className="card mb-6 print:break-inside-avoid">
        <div className="flex items-center space-x-2 mb-4">
          <FileText className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Differential Diagnosis</h2>
        </div>
        <div className="space-y-4">
          {aiAnalysis.differentialDiagnosis.map((dx, index) => (
            <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{index + 1}. {dx.diagnosis}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    dx.probability === 'High'
                      ? 'bg-red-100 text-red-700'
                      : dx.probability === 'Moderate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {dx.probability} Probability
                </span>
              </div>
              {dx.supportingFeatures && dx.supportingFeatures.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Supporting Features:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {dx.supportingFeatures.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {dx.investigationsNeeded && dx.investigationsNeeded.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Investigations Needed:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {dx.investigationsNeeded.map((inv, i) => (
                      <li key={i}>{inv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Investigations */}
      <div className="card mb-6 print:break-inside-avoid">
        <div className="flex items-center space-x-2 mb-4">
          <TestTube className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Recommended Investigations</h2>
        </div>
        {aiAnalysis.recommendedInvestigations.essential.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Essential:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {aiAnalysis.recommendedInvestigations.essential.map((inv, i) => (
                <li key={i}>{inv}</li>
              ))}
            </ul>
          </div>
        )}
        {aiAnalysis.recommendedInvestigations.additional.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Additional:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {aiAnalysis.recommendedInvestigations.additional.map((inv, i) => (
                <li key={i}>{inv}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Treatment Plan */}
      <div className="card mb-6 print:break-inside-avoid">
        <div className="flex items-center space-x-2 mb-4">
          <Pill className="text-primary-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Treatment Plan</h2>
        </div>
        
        {aiAnalysis.treatmentPlan.immediateManagement && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Immediate Management:</h3>
            <p className="text-red-800">{aiAnalysis.treatmentPlan.immediateManagement}</p>
          </div>
        )}

        {aiAnalysis.treatmentPlan.pharmacological.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Pharmacological:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {aiAnalysis.treatmentPlan.pharmacological.map((med, i) => (
                <li key={i}>{med}</li>
              ))}
            </ul>
          </div>
        )}

        {aiAnalysis.treatmentPlan.nonPharmacological.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Non-pharmacological:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {aiAnalysis.treatmentPlan.nonPharmacological.map((treat, i) => (
                <li key={i}>{treat}</li>
              ))}
            </ul>
          </div>
        )}

        {aiAnalysis.treatmentPlan.monitoring.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Monitoring:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {aiAnalysis.treatmentPlan.monitoring.map((mon, i) => (
                <li key={i}>{mon}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Patient Counseling */}
      {aiAnalysis.patientCounseling.length > 0 && (
        <div className="card mb-6 print:break-inside-avoid">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="text-primary-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Patient Counseling Points</h2>
          </div>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            {aiAnalysis.patientCounseling.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Red Flags */}
      {aiAnalysis.redFlags.length > 0 && (
        <div className="card mb-6 bg-red-50 border-red-200 print:break-inside-avoid">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-red-900">Red Flags / When to Seek Immediate Care</h2>
          </div>
          <ul className="list-disc list-inside text-red-800 space-y-2">
            {aiAnalysis.redFlags.map((flag, i) => (
              <li key={i} className="font-medium">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 print:break-inside-avoid">
        <p className="text-sm text-amber-800">
          <strong>Medical Disclaimer:</strong> This AI-powered tool provides clinical decision support 
          based on the information provided. It is designed to assist qualified healthcare professionals 
          and should not replace clinical judgment, physical examination, or consultation with specialists 
          when indicated. The treating physician bears ultimate responsibility for all clinical decisions.
        </p>
      </div>
    </div>
  );
};

export default CaseView;
