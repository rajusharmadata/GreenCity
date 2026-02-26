import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../features/auth/context/authcontext';
import { API_ENDPOINTS } from '../../../config/api';
import {
  FiBox,
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiBarChart2,
  FiPieChart,
  FiActivity,
  FiFilter,
  FiSearch,
  FiDownload,
  FiSettings,
  FiBell,
  FiEye,
  FiEdit,
  FiTrash2,
  FiZap,
  FiGlobe,
  FiShield,
  FiRefreshCw,
  FiInfo,
  FiGrid
} from 'react-icons/fi';

function AdminDashboard() {
  const { organization } = useAuth();
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

      const usersRes = await axiosInstance.get(API_ENDPOINTS.USER_RANK);
      if (usersRes.data) {
        setStats(prev => ({ ...prev, activeUsers: usersRes.data.length }));
      }

      const orgsRes = await axiosInstance.get(API_ENDPOINTS.ORG_RANK);
      if (orgsRes.data) {
        setStats(prev => ({ ...prev, totalOrganizations: orgsRes.data.length }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'in-progress': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || issue.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030d0a] flex items-center justify-center">
        <FiBox className="w-12 h-12 text-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200 selection:bg-emerald-500/20">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden lg:block w-72 bg-[#05110d] border-r border-white/5 min-h-screen p-8 sticky top-0">
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white flex items-center gap-3 uppercase tracking-tighter" style={{ fontFamily: 'Outfit' }}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <FiShield className="text-black w-5 h-5" />
              </div>
              GreenCity <span className="text-emerald-500">Ops</span>
            </h2>
          </div>

          <nav className="space-y-4">
            {[
              { icon: FiGrid, label: 'Control Center', active: true },
              { icon: FiFileText, label: 'Issue Archive' },
              { icon: FiUsers, label: 'Citizen Registry' },
              { icon: FiGlobe, label: 'Organizations' },
              { icon: FiBarChart2, label: 'Network Analytics' },
              { icon: FiSettings, label: 'Root Configuration' },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all font-mono text-[11px] font-black uppercase tracking-widest ${item.active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 lg:p-12 overflow-x-hidden">
          {/* Header */}
          <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.4em] font-mono mb-2">High Command Status: Optimal</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>
                Operational Overview.
              </h1>
              <p className="text-slate-400 font-medium mt-2" style={{ fontFamily: 'Inter' }}>Welcome back, administrator. Monitoring global environmental vectors.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={fetchDashboardData}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl flex items-center gap-3 transition-all text-xs font-bold uppercase tracking-widest font-mono"
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Sync Grid
              </button>
              <button className="bg-emerald-500 hover:bg-emerald-400 px-6 py-3 rounded-xl flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest font-mono text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <FiDownload className="w-4 h-4 text-black" />
                Export Manifest
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Citizen Nodes', value: stats.activeUsers, icon: FiUsers, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Intelligence Reports', value: stats.reportsReceived, icon: FiFileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Anomalies Resolved', value: stats.issuesResolved, icon: FiCheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
              { label: 'Org Entities', value: stats.totalOrganizations, icon: FiGlobe, color: 'text-amber-400', bg: 'bg-amber-400/10' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bio-card p-8 border-white/5 hover:border-emerald-500/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black font-mono">
                    <FiTrendingUp />
                    +5.2%
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{stat.value}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Analytics & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Status Distribution */}
            <div className="bio-card p-8 border-white/5 lg:col-span-1">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono mb-8 flex items-center gap-3">
                <FiPieChart className="text-emerald-500" />
                Status Vector Distribution
              </h2>
              <div className="space-y-6">
                {[
                  { label: 'Unchecked', count: stats.pendingIssues, color: 'bg-amber-500', pct: (stats.pendingIssues / issues.length) * 100 },
                  { label: 'Processing', count: stats.inProgressIssues, color: 'bg-blue-500', pct: (stats.inProgressIssues / issues.length) * 100 },
                  { label: 'Stabilized', count: stats.issuesResolved, color: 'bg-emerald-500', pct: (stats.issuesResolved / issues.length) * 100 }
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest font-mono mb-3">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white">{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.pct || 0}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Deployment Activity */}
            <div className="bio-card p-8 border-white/5 lg:col-span-2">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono mb-8 flex items-center gap-3">
                <FiActivity className="text-emerald-500" />
                Real-Time Deployment Feed
              </h2>
              <div className="space-y-4">
                {issues.slice(0, 5).map((issue, i) => (
                  <div key={issue._id} className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all group">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getStatusColor(issue.status)}`}>
                        <FiInfo className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-white truncate" style={{ fontFamily: 'Inter' }}>{issue.title}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate uppercase font-mono tracking-widest mt-1">{issue.location}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-black text-slate-600 font-mono uppercase tracking-widest">
                        {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Issue Repository Table */}
          <div className="bio-card border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em] font-mono flex items-center gap-3">
                  <FiFileText className="text-emerald-500" />
                  Intelligence Collective
                </h2>
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                  <div className="relative group flex-1 lg:flex-none lg:w-64">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      placeholder="SEARCH INDEX..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white focus:outline-none focus:border-emerald-500/30 uppercase tracking-widest font-mono"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 focus:outline-none focus:border-emerald-500/30 font-mono uppercase tracking-widest cursor-pointer"
                  >
                    <option value="all">ALL STATUS</option>
                    <option value="pending">PENDING</option>
                    <option value="in-progress">PROCESSING</option>
                    <option value="resolved">STABILIZED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Anomaly ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Classification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Geospatial Data</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Signal Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Priority</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-inter">
                  {filteredIssues.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-8 py-24 text-center">
                        <FiAlertTriangle className="w-12 h-12 text-slate-700 mx-auto mb-6" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] font-mono">Index Empty / Query Invalid</p>
                      </td>
                    </tr>
                  ) : (
                    filteredIssues.map((issue) => (
                      <tr key={issue._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-black text-white font-mono uppercase tracking-tighter">#{issue.issueCode || issue._id.slice(-6)}</p>
                        </td>
                        <td className="px-8 py-6 min-w-[200px]">
                          <p className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Inter' }}>{issue.title}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-1 opacity-60 group-hover:opacity-100 transition-opacity">Archive Node v2.0</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <FiMapPin className="text-emerald-500/60" />
                            <span className="truncate max-w-[150px]">{issue.location}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border font-mono ${getStatusColor(issue.status)}`}>
                            {issue.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-bold uppercase tracking-widest font-mono ${issue.priority === 'high' ? 'text-red-400' : issue.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {issue.priority || 'MED'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3">
                            <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/30 transition-all">
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all">
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
