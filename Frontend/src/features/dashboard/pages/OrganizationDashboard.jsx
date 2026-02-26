import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheckCircle,
  FiLoader,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiFlag,
  FiClock,
  FiTruck,
  FiTrendingUp,
  FiPlus,
  FiX,
  FiDollarSign,
  FiPhone,
  FiMail,
  FiNavigation,
  FiZap,
  FiActivity,
  FiInfo,
  FiTarget,
  FiCpu
} from 'react-icons/fi';
import { FaBus, FaTrain, FaCar, FaBicycle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';
import { useAuth } from '../../../features/auth/context/authcontext';
import { useNotification } from '../../../context/NotificationContext';

const StatusBadge = ({ label, tone = 'info' }) => {
  const tones = {
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    warn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border font-mono ${tones[tone]}`}>
      <div className={`w-1 h-1 rounded-full ${tone === 'success' ? 'bg-emerald-400' : tone === 'warn' ? 'bg-amber-400' : 'bg-blue-400'} animate-pulse`} />
      {label}
    </span>
  );
};

function OrganizationDashboard() {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [pendingIssues, setPendingIssues] = useState([]);
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [transportEntries, setTransportEntries] = useState([]);
  const [transportStats, setTransportStats] = useState({ total: 0, byType: {}, routes: [], totalRoutes: 0 });
  const [loading, setLoading] = useState(true);
  const [transportLoading, setTransportLoading] = useState(true);
  const [actioningIssue, setActioningIssue] = useState('');
  const [search, setSearch] = useState('');
  const [showAddTransport, setShowAddTransport] = useState(false);
  const [newTransport, setNewTransport] = useState({
    transportType: '',
    from: '',
    to: '',
    departureTimes: [''],
    frequency: 'daily',
    fare: '',
    contactInfo: ''
  });
  const [submittingTransport, setSubmittingTransport] = useState(false);

  const organizationId = organization?.organizationId;
  const organizationName = organization?.organizationName;

  const fetchDashboard = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const [issuesRes, solvedRes] = await Promise.all([
        axiosInstance.get(API_ENDPOINTS.GET_ALL_ISSUES),
        axiosInstance.get(API_ENDPOINTS.ORG_RESOLVED_ISSUES)
      ]);
      setPendingIssues(issuesRes.data || []);
      setResolvedIssues(solvedRes.data || []);
    } catch (error) {
      console.error('Organization dashboard load failed', error);
      notifyError('Unable to load organization dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, notifyError]);

  const fetchTransportData = useCallback(async () => {
    if (!organizationName) return;
    setTransportLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.GET_ORG_TRANSPORTS}/${encodeURIComponent(organizationName)}`);
      if (response.data) {
        setTransportEntries(response.data.entries || []);
        setTransportStats(response.data.stats || { total: 0, byType: {}, routes: [], totalRoutes: 0 });
      }
    } catch (error) {
      if (error.response?.status !== 404) notifyError('Unable to load transport data.');
    } finally {
      setTransportLoading(false);
    }
  }, [organizationName, notifyError]);

  useEffect(() => {
    if (!organization) {
      navigate('/login/org', { replace: true });
      return;
    }
    fetchDashboard();
    fetchTransportData();
  }, [organization, fetchDashboard, fetchTransportData, navigate]);

  const handleDepartureTimeChange = (index, value) => {
    const newTimes = [...newTransport.departureTimes];
    newTimes[index] = value;
    setNewTransport({ ...newTransport, departureTimes: newTimes });
  };

  const handleSubmitTransport = async (e) => {
    e.preventDefault();
    if (!newTransport.transportType || !newTransport.from || !newTransport.to || !newTransport.fare) {
      notifyError('Required fields missing');
      return;
    }
    const validTimes = newTransport.departureTimes.filter(time => time.trim() !== '');
    setSubmittingTransport(true);
    try {
      const payload = {
        agencyName: organizationName,
        transportType: newTransport.transportType,
        from: newTransport.from,
        to: newTransport.to,
        departureTimes: validTimes,
        frequency: newTransport.frequency,
        fare: parseFloat(newTransport.fare),
        contactInfo: newTransport.contactInfo || organization?.phone || 'Not provided'
      };
      await axiosInstance.post(API_ENDPOINTS.TRANSPORT_ENTRY, payload);
      notifySuccess('Transport entry synced.');
      setNewTransport({ transportType: '', from: '', to: '', departureTimes: [''], frequency: 'daily', fare: '', contactInfo: '' });
      setShowAddTransport(false);
      await fetchTransportData();
    } catch (error) {
      notifyError(error.response?.data?.message || 'Failed to sync transport.');
    } finally {
      setSubmittingTransport(false);
    }
  };

  const getTransportIcon = (type) => {
    const icons = { Bus: FaBus, Train: FaTrain, Metro: FiNavigation, SharedCab: FaCar, Car: FaCar, Bike: FaBicycle, Other: FiZap };
    const Icon = icons[type] || FiTruck;
    return <Icon />;
  };

  const filteredIssues = useMemo(() => {
    const term = search.toLowerCase();
    return pendingIssues.filter((issue) =>
      !search || issue.issueCode?.toLowerCase().includes(term) ||
      issue.title?.toLowerCase().includes(term) ||
      issue.location?.toLowerCase().includes(term)
    );
  }, [pendingIssues, search]);

  const handleResolve = async (issue) => {
    if (!organizationId) return;
    setActioningIssue(issue.issueCode);
    try {
      await axiosInstance.post(API_ENDPOINTS.MARK_ISSUE_SOLVED, {
        issueCode: issue.issueCode,
        solvedBy: organizationId,
        IssueSolved: true
      });
      notifySuccess(`Signal ${issue.issueCode} stabilized.`);
      setPendingIssues((prev) => prev.filter((entry) => entry.issueCode !== issue.issueCode));
      setResolvedIssues((prev) => [{ ...issue, solvedAt: new Date().toISOString() }, ...prev]);
    } catch (error) {
      notifyError(error.response?.data?.message || 'Failed to update signal.');
    } finally {
      setActioningIssue('');
    }
  };

  if (!organization) return null;

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200 selection:bg-emerald-500/20">
      <div className="container mx-auto px-6 pt-48 pb-24 max-w-7xl">

        {/* ─── HEADER ─── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-20 border-b border-white/5 pb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono mb-3 uppercase">Command Center Alpha</p>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter" style={{ fontFamily: 'Outfit' }}>
              {organization.organizationName || 'Entity Dashboard'}.
            </h1>
            <p className="mt-4 text-lg text-slate-400 font-medium max-w-2xl" style={{ fontFamily: 'Inter' }}>
              Manage municipal infrastructure, calibrate transport telemetry, and resolve citizen anomaly reports.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StatusBadge label={`ID: ${organizationId}`} tone="info" />
              <StatusBadge label={`${resolvedIssues.length} signals stabilized`} tone="success" />
              <StatusBadge label={`${pendingIssues.length} awaiting triage`} tone="warn" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddTransport(true)}
              className="px-8 py-4 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] font-mono shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-3"
            >
              <FiPlus className="w-4 h-4" />
              Ingress Transport Data
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchDashboard}
              disabled={loading}
              className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] font-mono hover:bg-white/10 transition flex items-center gap-3"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sync Feeds
            </motion.button>
          </div>
        </div>

        {/* ─── STATS GRID ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
          {[
            { label: 'Pending Triage', value: pendingIssues.length, icon: FiFlag, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Total Stabilized', value: resolvedIssues.length, icon: FiCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Active Routes', value: transportStats.totalRoutes, icon: FiNavigation, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Network Transports', value: transportStats.total, icon: FiTruck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Asset Classes', value: Object.keys(transportStats.byType || {}).length, icon: FiCpu, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
            { label: 'Merit Index', value: '0.98', icon: FiActivity, color: 'text-pink-400', bg: 'bg-pink-400/10' }
          ].map((stat, i) => (
            <div key={i} className="bio-card p-6 border-white/5 group hover:border-emerald-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon />
                </div>
              </div>
              <p className="text-2xl font-black text-white" style={{ fontFamily: 'Outfit' }}>{stat.value}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: Issues Management */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bio-card border-white/5 p-8 lg:p-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] font-mono flex items-center gap-3">
                    <FiFlag className="text-emerald-500" />
                    Pending Signal Triage
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mt-2">Citizens reporting anomalies in your sector</p>
                </div>
                <div className="relative group w-full md:w-64">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500" />
                  <input
                    type="text"
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="QUERY INDEX..."
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white outline-none focus:border-emerald-500/30 uppercase tracking-widest font-mono"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 text-center"><FiLoader className="w-8 h-8 animate-spin text-emerald-500 mx-auto" /></div>
                ) : filteredIssues.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <FiTarget className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-mono">No active signals found in the sector buffer.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <motion.div
                      key={issue._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-emerald-500/20 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1 truncate" style={{ fontFamily: 'Outfit' }}>{issue.title}</h3>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">SIGNAL #{issue.issueCode}</p>
                        </div>
                        <StatusBadge label="Awaiting Approval" tone="warn" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium mb-6 line-clamp-2" style={{ fontFamily: 'Inter' }}>{issue.description}</p>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t border-white/5 pt-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">
                          <FiMapPin className="text-emerald-500/60" />
                          <span className="truncate max-w-[200px]">{issue.location}</span>
                        </div>
                        <button
                          onClick={() => handleResolve(issue)}
                          disabled={Boolean(actioningIssue)}
                          className="px-6 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black uppercase tracking-widest text-[9px] font-mono hover:bg-emerald-500 hover:text-black transition-all flex items-center gap-2"
                        >
                          {actioningIssue === issue.issueCode ? <FiLoader className="animate-spin" /> : <FiCheckCircle />}
                          Stabilize Signal
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>

            {/* Transport Entries Grid */}
            <section className="bio-card border-white/5 p-8 lg:p-10">
              <h2 className="text-xs font-black text-white uppercase tracking-[0.3em] font-mono flex items-center gap-3 mb-10">
                <FiTruck className="text-emerald-500" />
                Transport Telemetry Grid
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                {transportEntries.slice(0, 4).map((entry) => (
                  <div key={entry._id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-emerald-500/20 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg shadow-inner">
                          {getTransportIcon(entry.transportType)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white uppercase tracking-widest font-mono">{entry.transportType}</p>
                          <p className="text-[11px] font-bold text-slate-500 uppercase font-mono mt-0.5">{entry.from} <span className="text-emerald-500">→</span> {entry.to}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">Uplink Status</p>
                        <p className="text-[10px] font-black text-emerald-400 uppercase font-mono mt-0.5">Active</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest font-mono">Fare Matrix</p>
                        <p className="text-[10px] font-black text-white uppercase font-mono mt-0.5">₹{entry.fare}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Activity Sidebar */}
          <div className="space-y-12">
            <section className="bio-card border-white/5 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-mono">History Log</h2>
                <FiActivity className="text-emerald-500 w-4 h-4" />
              </div>
              <div className="space-y-6">
                {resolvedIssues.length === 0 ? (
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono text-center py-8">Log currently clear.</p>
                ) : (
                  resolvedIssues.slice(0, 8).map((entry) => (
                    <div key={entry.issueCode} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500">
                      <p className="text-xs font-bold text-white mb-1 truncate">{entry.title}</p>
                      <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">
                        <span>SIGNAL #{entry.issueCode}</span>
                        <span className="text-emerald-500/60">{new Date(entry.solvedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bio-card border-white/5 p-8 bg-emerald-500/[0.02]">
              <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] font-mono mb-6">Asset Distribution</h2>
              <div className="space-y-4">
                {Object.entries(transportStats.byType || {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">{type}</span>
                    <span className="text-sm font-black text-white font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

      </div>

      {/* ─── ADD TRANSPORT MODAL ─── */}
      <AnimatePresence>
        {showAddTransport && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#030d0a]/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bio-card border-emerald-500/20 p-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-4" style={{ fontFamily: 'Outfit' }}>
                  <FiTruck className="text-emerald-500" />
                  Initialize Transport Node
                </h2>
                <button
                  onClick={() => setShowAddTransport(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmitTransport} className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Asset Type *</label>
                    <select
                      value={newTransport.transportType}
                      onChange={(e) => setNewTransport({ ...newTransport, transportType: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest cursor-pointer appearance-none"
                      required
                    >
                      <option value="">Select Asset</option>
                      <option value="Bus">Bus (Municipal)</option>
                      <option value="Train">Rail (Regional)</option>
                      <option value="Metro">Subway (Urban)</option>
                      <option value="SharedCab">Shared Transit</option>
                      <option value="Car">Direct Transit</option>
                      <option value="Bike">Micro-Mobility</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Interval Frequency</label>
                    <select
                      value={newTransport.frequency}
                      onChange={(e) => setNewTransport({ ...newTransport, frequency: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest appearance-none"
                    >
                      <option value="daily">Standard (Daily)</option>
                      <option value="weekly">Extended (Weekly)</option>
                      <option value="weekdays">Business (Weekdays)</option>
                      <option value="weekends">Leisure (Weekends)</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Node Ingress (From) *</label>
                    <input
                      type="text"
                      value={newTransport.from}
                      onChange={(e) => setNewTransport({ ...newTransport, from: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest placeholder:text-slate-700"
                      placeholder="HUB ALPHA..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Node Egress (To) *</label>
                    <input
                      type="text"
                      value={newTransport.to}
                      onChange={(e) => setNewTransport({ ...newTransport, to: e.target.value })}
                      className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest placeholder:text-slate-700"
                      placeholder="HUB OMEGA..."
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Temporal Deployment *</label>
                  {newTransport.departureTimes.map((time, index) => (
                    <div key={index} className="flex gap-4">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleDepartureTimeChange(index, e.target.value)}
                        className="flex-1 bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-xs font-bold text-white outline-none focus:border-emerald-500/30 transition-all font-mono"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-10 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowAddTransport(false)}
                    className="flex-1 px-8 py-4 rounded-xl border-2 border-white/5 text-slate-500 font-black uppercase text-[10px] tracking-widest font-mono hover:text-white transition-all"
                  >
                    Abort Protocol
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTransport}
                    className="flex-[2] py-4 bg-emerald-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] font-mono shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 disabled:opacity-40"
                  >
                    {submittingTransport ? <FiLoader className="animate-spin" /> : <FiZap />}
                    Commit Entry to Grid
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrganizationDashboard;
