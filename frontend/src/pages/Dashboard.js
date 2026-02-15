import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseAPI } from '../services/api';
import { FileText, PlusCircle, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    analyzed: 0,
    reviewed: 0
  });
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await caseAPI.getCases({ limit: 5 });
      const cases = response.data.cases;
      
      setRecentCases(cases);
      
      // Calculate stats
      setStats({
        total: response.data.pagination.total,
        analyzed: cases.filter(c => c.status === 'analyzed').length,
        reviewed: cases.filter(c => c.status === 'reviewed').length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your clinical consultations.
        </p>
      </div>

      {/* Quick Action */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Start a New Consultation</h2>
            <p className="text-primary-100 mb-4">
              Analyze a patient case with AI-powered clinical decision support
            </p>
            <Link to="/cases/new" className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
              <PlusCircle size={20} />
              <span>New Case</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <FileText size={80} className="text-primary-300 opacity-50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Cases</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Analyzed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.analyzed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Reviewed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.reviewed}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Cases</h2>
          <Link to="/cases" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        {recentCases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-600 mb-4">No cases yet</p>
            <Link to="/cases/new" className="btn-primary">
              Create Your First Case
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentCases.map((caseItem) => (
              <Link
                key={caseItem._id}
                to={`/cases/${caseItem._id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">
                        Patient ID: {caseItem.patientInfo.patientId}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 text-sm">
                        {caseItem.patientInfo.age}Y, {caseItem.patientInfo.gender}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2 line-clamp-1">
                      {caseItem.clinicalData.chiefComplaint}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatDate(caseItem.createdAt)}</span>
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          caseItem.status === 'analyzed'
                            ? 'bg-green-100 text-green-700'
                            : caseItem.status === 'reviewed'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Medical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="text-amber-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Clinical Decision Support Tool</p>
            <p>
              This AI-powered tool provides clinical decision support based on the information provided. 
              It is designed to assist qualified healthcare professionals and should not replace clinical 
              judgment, physical examination, or consultation with specialists when indicated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
