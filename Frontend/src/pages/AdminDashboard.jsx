import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Search,
  Download,
  Settings,
  Bell,
  Eye,
  Edit,
  Trash2,
  Award,
  Target,
  Zap,
  Globe,
  Shield,
  RefreshCw
} from 'lucide-react';

function AdminDashboard() {
  const { organization, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeUsers: 0,
    reportsReceived: 0,
    issuesResolved: 0,
    pendingIssues: 0,
    inProgressIssues: 0
  });
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!organization) {
      navigate('/login/admin');
      return;
    }
    fetchDashboardData();
  }, [organization, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all issues
      const issuesRes = await axiosInstance.get(API_ENDPOINTS.GET_ALL_ISSUES);
      if (issuesRes.data) {
        setIssues(issuesRes.data);
        const resolved = issuesRes.data.filter(issue => issue.status === 'resolved').length;
        const pending = issuesRes.data.filter(issue => issue.status === 'pending').length;
        const inProgress = issuesRes.data.filter(issue => issue.status === 'in-progress').length;
        
        setStats(prev => ({ 
          ...prev, 
          reportsReceived: issuesRes.data.length,
          issuesResolved: resolved,
          pendingIssues: pending,
          inProgressIssues: inProgress
        }));
      }

      // Fetch user rankings to get total users
      try {
        const usersRes = await axiosInstance.get(API_ENDPOINTS.USER_RANK);
        if (usersRes.data) {
          setUsers(usersRes.data);
          setStats(prev => ({ ...prev, activeUsers: usersRes.data.length }));
        }
      } catch (err) {
        console.error('Error fetching users:', err);
      }

      // Fetch organization rankings
      try {
        const orgsRes = await axiosInstance.get(API_ENDPOINTS.ORG_RANK);
        if (orgsRes.data) {
          setOrganizations(orgsRes.data);
          setStats(prev => ({ ...prev, totalOrganizations: orgsRes.data.length }));
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-400 flex items-center">
              <Building2 className="w-8 h-8 mr-2" />
              Admin Portal
            </h2>
          </div>
          
          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: 'Dashboard', active: true },
              { icon: FileText, label: 'Issues Management' },
              { icon: Users, label: 'User Management' },
              { icon: Building2, label: 'Organizations' },
              { icon: Activity, label: 'Analytics' },
              { icon: Settings, label: 'Settings' },
            ].map((item, index) => (
              <button
                key={item.label}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  item.active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {organization?.organizationName || 'Admin'}!
                </h1>
                <p className="text-gray-400">Monitor and manage your environmental initiatives</p>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12%
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.activeUsers}</h3>
              <p className="text-gray-400 text-sm">Active Users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8%
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.reportsReceived}</h3>
              <p className="text-gray-400 text-sm">Total Reports</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15%
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.issuesResolved}</h3>
              <p className="text-gray-400 text-sm">Resolved Issues</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5%
                </span>
              </div>
              <h3 className="text-2xl font-bold">{stats.totalOrganizations}</h3>
              <p className="text-gray-400 text-sm">Organizations</p>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Issue Status Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-blue-400" />
                Issue Status Distribution
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                    <span>Pending</span>
                  </div>
                  <span className="font-bold">{stats.pendingIssues}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span>In Progress</span>
                  </div>
                  <span className="font-bold">{stats.inProgressIssues}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span>Resolved</span>
                  </div>
                  <span className="font-bold">{stats.issuesResolved}</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Recent Activity
              </h2>
              <div className="space-y-3">
                {issues.slice(0, 5).map((issue, index) => (
                  <div key={issue._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(issue.status)}`}>
                        {getStatusIcon(issue.status)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-gray-400">{issue.location}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Issues Management Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl border border-gray-700"
          >
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-400" />
                  Issues Management
                </h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-lg font-medium mb-2">No issues found</p>
                        <p className="text-sm">No issues match your search criteria or there are no issues reported yet.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-gray-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-white">{issue.title || 'Untitled Issue'}</div>
                            <div className="text-xs text-gray-400 mt-1">ID: {issue.issueCode || issue._id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 max-w-xs truncate">
                            {issue.description || 'No description provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                            <span className="text-gray-300">{issue.location || 'Location not specified'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
                            {getStatusIcon(issue.status)}
                            <span className="ml-1">{issue.status || 'pending'}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority || 'medium')}`}>
                            {issue.priority || 'medium'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-green-400 hover:text-green-300 transition-colors"
                              title="Edit issue"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete issue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
