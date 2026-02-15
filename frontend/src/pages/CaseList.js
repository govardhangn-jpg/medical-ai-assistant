import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseAPI } from '../services/api';
import { FileText, Search, Filter, Eye } from 'lucide-react';

const CaseList = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

 

  useEffect(() => {
  fetchCases();
}, [fetchCases]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(statusFilter && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await caseAPI.getCases(params);
      setCases(response.data.cases);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cases:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCases();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  if (loading && cases.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Case History
        </h1>
        <p className="text-gray-600">
          View and manage all your patient consultations
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search by Patient ID or Chief Complaint..."
              />
            </div>
          </form>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className="input-field pl-10"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="analyzed">Analyzed</option>
                <option value="reviewed">Reviewed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      {cases.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-600 mb-4">No cases found</p>
          <Link to="/cases/new" className="btn-primary">
            Create New Case
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cases.map((caseItem) => (
              <div
                key={caseItem._id}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Patient ID: {caseItem.patientInfo.patientId}
                      </h3>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">
                        {caseItem.patientInfo.age}Y, {caseItem.patientInfo.gender}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          caseItem.status === 'analyzed'
                            ? 'bg-green-100 text-green-700'
                            : caseItem.status === 'reviewed'
                            ? 'bg-purple-100 text-purple-700'
                            : caseItem.status === 'archived'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {caseItem.status}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">
                      <span className="font-medium">Chief Complaint:</span>{' '}
                      {caseItem.clinicalData.chiefComplaint}
                    </p>

                    {caseItem.aiAnalysis?.differentialDiagnosis?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Top Diagnosis:
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {caseItem.aiAnalysis.differentialDiagnosis[0].diagnosis}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Created: {formatDate(caseItem.createdAt)}</span>
                      {caseItem.updatedAt !== caseItem.createdAt && (
                        <>
                          <span>•</span>
                          <span>Updated: {formatDate(caseItem.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/cases/${caseItem._id}`}
                    className="ml-4 btn-primary flex items-center space-x-2"
                  >
                    <Eye size={18} />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          page === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} cases
          </div>
        </>
      )}
    </div>
  );
};

export default CaseList;
