import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, MapPin, RefreshCw, ShieldCheck, Flag, TimerReset, Bus, Train, Car, Route, TrendingUp, Plus, X, Clock, DollarSign, Phone, Mail, Navigation, Zap, Bike } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';

const StatusBadge = ({ label, tone = 'info' }) => {
  const colors = {
    info: 'bg-emerald-100 text-emerald-700',
    warn: 'bg-amber-100 text-amber-700',
    success: 'bg-sky-100 text-sky-700'
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${colors[tone]}`}>
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
  const [transportStats, setTransportStats] = useState({
    total: 0,
    byType: {},
    routes: [],
    totalRoutes: 0
  });
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
    if (!organizationId) {
      return;
    }
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
    if (!organizationName) {
      return;
    }
    setTransportLoading(true);
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.GET_ORG_TRANSPORTS}/${encodeURIComponent(organizationName)}`);
      if (response.data) {
        setTransportEntries(response.data.entries || []);
        setTransportStats(response.data.stats || {
          total: 0,
          byType: {},
          routes: [],
          totalRoutes: 0
        });
      }
    } catch (error) {
      console.error('Error fetching transport data:', error);
      // Don't show error if no transports found (organization might not have added any yet)
      if (error.response?.status !== 404) {
        notifyError('Unable to load transport data.');
      }
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

  const handleAddDepartureTime = () => {
    setNewTransport({
      ...newTransport,
      departureTimes: [...newTransport.departureTimes, '']
    });
  };

  const handleRemoveDepartureTime = (index) => {
    const newTimes = newTransport.departureTimes.filter((_, i) => i !== index);
    setNewTransport({ ...newTransport, departureTimes: newTimes });
  };

  const handleDepartureTimeChange = (index, value) => {
    const newTimes = [...newTransport.departureTimes];
    newTimes[index] = value;
    setNewTransport({ ...newTransport, departureTimes: newTimes });
  };

  const handleSubmitTransport = async (e) => {
    e.preventDefault();
    
    if (!newTransport.transportType || !newTransport.from || !newTransport.to || !newTransport.fare) {
      notifyError('Please fill in all required fields');
      return;
    }

    const validTimes = newTransport.departureTimes.filter(time => time.trim() !== '');
    if (validTimes.length === 0) {
      notifyError('Please add at least one departure time');
      return;
    }

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
      notifySuccess('Transport entry added successfully!');
      
      // Reset form
      setNewTransport({
        transportType: '',
        from: '',
        to: '',
        departureTimes: [''],
        frequency: 'daily',
        fare: '',
        contactInfo: ''
      });
      setShowAddTransport(false);
      
      // Refresh transport data
      await fetchTransportData();
    } catch (error) {
      console.error('Error adding transport entry:', error);
      notifyError(error.response?.data?.message || 'Failed to add transport entry');
    } finally {
      setSubmittingTransport(false);
    }
  };

  const getTransportIcon = (type) => {
    const icons = {
      Bus: Bus,
      Train: Train,
      Metro: Navigation,
      SharedCab: Car,
      Car: Car,
      Bike: Bike,
      Other: Zap
    };
    return icons[type] || Route;
  };

  const isTransportActive = (entry) => {
    // Consider a transport active if it has departure times and was created recently (within last 30 days)
    const createdDate = new Date(entry.createdAt);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation <= 30 && entry.departureTimes && entry.departureTimes.length > 0;
  };

  const filteredIssues = useMemo(() => {
    if (!search.trim()) {
      return pendingIssues;
    }
    const term = search.toLowerCase();
    return pendingIssues.filter((issue) => {
      return (
        issue.issueCode?.toLowerCase().includes(term) ||
        issue.title?.toLowerCase().includes(term) ||
        issue.location?.toLowerCase().includes(term)
      );
    });
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
      notifySuccess(`Issue ${issue.issueCode} marked as resolved`);
      setPendingIssues((prev) => prev.filter((entry) => entry.issueCode !== issue.issueCode));
      setResolvedIssues((prev) => [
        {
          issueCode: issue.issueCode,
          title: issue.title,
          description: issue.description,
          location: issue.location,
          image: issue.image,
          solvedBy: organizationId,
          solvedAt: new Date().toISOString()
        },
        ...prev
      ]);
    } catch (error) {
      console.error('Issue resolution failed', error);
      const message = error.response?.data?.message || 'Failed to mark issue as resolved.';
      notifyError(message);
    } finally {
      setActioningIssue('');
    }
  };

  const summary = useMemo(() => {
    const pending = pendingIssues.length;
    const resolved = resolvedIssues.length;
    const solvedThisWeek = resolvedIssues.filter((issue) => {
      const solvedDate = new Date(issue.solvedAt);
      const delta = Date.now() - solvedDate.getTime();
      return delta <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return { pending, resolved, solvedThisWeek };
  }, [pendingIssues.length, resolvedIssues]);

  if (!organization) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/80">Organization Command Center</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            {organization.organizationName || 'Organization Dashboard'}
          </h1>
          <p className="mt-2 text-sm text-slate-300/80 max-w-2xl">
            Review citizen submissions, mark issues as resolved, and keep your GreenCity impact score up-to-date in one
            place.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-100/80">
            <StatusBadge label={`Organization ID: ${organizationId}`} tone="info" />
            <StatusBadge label={`${summary.resolved} issues resolved`} tone="success" />
            <StatusBadge label={`${summary.pending} awaiting approval`} tone="warn" />
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddTransport(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Transport Entry
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh feed
          </motion.button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
        {[
          {
            label: 'Pending reports',
            value: summary.pending,
            icon: Flag,
            accent: 'bg-amber-500/20 text-amber-200'
          },
          {
            label: 'Resolved (all time)',
            value: summary.resolved,
            icon: CheckCircle2,
            accent: 'bg-emerald-500/20 text-emerald-200'
          },
          {
            label: 'Resolved this week',
            value: summary.solvedThisWeek,
            icon: TimerReset,
            accent: 'bg-sky-500/20 text-sky-200'
          },
          {
            label: 'Transport Entries',
            value: transportStats.total,
            icon: Route,
            accent: 'bg-purple-500/20 text-purple-200'
          },
          {
            label: 'Total Routes',
            value: transportStats.totalRoutes,
            icon: MapPin,
            accent: 'bg-indigo-500/20 text-indigo-200'
          },
          {
            label: 'Transport Types',
            value: Object.keys(transportStats.byType || {}).length,
            icon: Bus,
            accent: 'bg-pink-500/20 text-pink-200'
          }
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/5 bg-white/5 p-5 shadow-inner shadow-black/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-200/80">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
              </div>
              <div className={`rounded-2xl p-3 ${card.accent}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Transports Section */}
      {transportStats.total > 0 && (
        <div className="mt-10 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                Currently Active Transports
              </h2>
              <p className="text-sm text-slate-300/80 mt-1">
                Transports that are currently operational and serving routes
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {transportEntries
              .filter(entry => isTransportActive(entry))
              .map((entry) => {
                const Icon = getTransportIcon(entry.transportType);
                return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500/20 p-2">
                          <Icon className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{entry.transportType}</h3>
                          <p className="text-xs text-slate-400">{entry.from} → {entry.to}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        Active
                      </span>
                    </div>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{entry.departureTimes?.slice(0, 2).join(', ')}{entry.departureTimes?.length > 2 ? '...' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-slate-400" />
                        <span>₹{entry.fare}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Route className="h-3 w-3 text-slate-400" />
                        <span>{entry.frequency || 'Daily'}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {transportEntries.filter(entry => isTransportActive(entry)).length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-400">No active transports at the moment</p>
            </div>
          )}
        </div>
      )}

      {/* Transport Statistics Section */}
      {transportStats.total > 0 && (
        <div className="mt-10 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Route className="h-5 w-5 text-purple-300" />
                All Transport Entries
              </h2>
              <p className="text-sm text-slate-300/80 mt-1">
                Complete overview of all transport entries added by your organization
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={fetchTransportData}
              disabled={transportLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:bg-purple-700 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${transportLoading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {Object.entries(transportStats.byType || {}).map(([type, count]) => {
              const icons = {
                Bus: Bus,
                Train: Train,
                Metro: Train,
                Car: Car,
                SharedCab: Car,
                Other: Route
              };
              const Icon = icons[type] || Route;
              return (
                <div key={type} className="rounded-2xl border border-white/5 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{type}</p>
                      <p className="mt-1 text-2xl font-bold text-white">{count}</p>
                    </div>
                    <div className="rounded-xl bg-purple-500/20 p-3">
                      <Icon className="h-5 w-5 text-purple-300" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Routes List */}
          {transportStats.routes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-indigo-300" />
                Routes ({transportStats.totalRoutes})
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {transportStats.routes.map((route, index) => (
                  <div key={index} className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{route.route}</p>
                        <p className="text-xs text-slate-400 mt-1">{route.transportType}</p>
                      </div>
                      <span className="text-xs text-slate-300 bg-white/10 px-2 py-1 rounded-full">
                        {route.count} {route.count === 1 ? 'entry' : 'entries'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Transport Entries Table */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-300" />
              All Transport Entries ({transportEntries.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Departure Times</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Fare</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Frequency</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Date Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transportEntries.map((entry) => {
                    const active = isTransportActive(entry);
                    const Icon = getTransportIcon(entry.transportType);
                    return (
                      <tr key={entry._id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-purple-300" />
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-200">
                              {entry.transportType}
                            </span>
                            {active && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-white">
                          <div className="font-medium">{entry.from}</div>
                          <div className="text-slate-400 text-xs">→ {entry.to}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-300">
                          {Array.isArray(entry.departureTimes) 
                            ? entry.departureTimes.slice(0, 3).join(', ') + (entry.departureTimes.length > 3 ? '...' : '')
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white">₹{entry.fare}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{entry.frequency || 'N/A'}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {transportStats.total === 0 && !transportLoading && (
        <div className="mt-10 rounded-3xl border border-white/5 bg-white/5 p-8 text-center">
          <Route className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Transport Entries Yet</h3>
          <p className="text-sm text-slate-400 mb-4">
            Start adding transport routes to see statistics and details here.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Pending citizen reports</h2>
              <p className="text-sm text-slate-300/80">
                Approve and resolve issues to keep the city maintenance queue moving.
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by code, title or location"
              className="rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-2 text-sm text-white placeholder:text-slate-400 focus:border-emerald-300/60 focus:outline-none"
            />
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
            ) : filteredIssues.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">No pending issues left to review.</p>
            ) : (
              filteredIssues.map((issue) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-slate-900/60 p-4 shadow-lg shadow-black/20"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">{issue.title}</h3>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      #{issue.issueCode}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300/80 line-clamp-2">{issue.description}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    <MapPin className="mr-1 inline h-3.5 w-3.5 text-emerald-300" />
                    {issue.location || 'Location unavailable'}
                  </p>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      onClick={() => handleResolve(issue)}
                      disabled={Boolean(actioningIssue)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {actioningIssue === issue.issueCode ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Marking...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Mark as resolved
                        </>
                      )}
                    </button>
                    <StatusBadge label="Awaiting approval" tone="warn" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recently resolved</h2>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <p className="mt-2 text-sm text-slate-300/80">Track the issues your organization has already closed.</p>

          <div className="mt-6 space-y-4">
            {resolvedIssues.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No resolved issues yet.</p>
            ) : (
              resolvedIssues.slice(0, 6).map((entry) => (
                <div key={entry.issueCode} className="rounded-2xl bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{entry.title || entry.issueCode}</p>
                    <span className="text-xs text-emerald-300">
                      {new Date(entry.solvedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">#{entry.issueCode}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    <MapPin className="mr-1 inline h-3 w-3 text-emerald-300" />
                    {entry.location || 'Location unavailable'}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Add Transport Entry Modal */}
      <AnimatePresence>
        {showAddTransport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !submittingTransport && setShowAddTransport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Plus className="h-6 w-6 text-purple-300" />
                  Add New Transport Entry
                </h2>
                <button
                  onClick={() => setShowAddTransport(false)}
                  disabled={submittingTransport}
                  className="rounded-full p-2 hover:bg-white/10 transition disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmitTransport} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Transport Type *
                    </label>
                    <select
                      value={newTransport.transportType}
                      onChange={(e) => setNewTransport({ ...newTransport, transportType: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="Bus">Bus</option>
                      <option value="Train">Train</option>
                      <option value="Metro">Metro</option>
                      <option value="SharedCab">Shared Cab</option>
                      <option value="Car">Car/Taxi</option>
                      <option value="Bike">Bike/Scooter</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Frequency
                    </label>
                    <select
                      value={newTransport.frequency}
                      onChange={(e) => setNewTransport({ ...newTransport, frequency: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="weekdays">Weekdays</option>
                      <option value="weekends">Weekends</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      From Location *
                    </label>
                    <input
                      type="text"
                      value={newTransport.from}
                      onChange={(e) => setNewTransport({ ...newTransport, from: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      placeholder="Starting point"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      To Location *
                    </label>
                    <input
                      type="text"
                      value={newTransport.to}
                      onChange={(e) => setNewTransport({ ...newTransport, to: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      placeholder="Destination"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Departure Times *
                  </label>
                  <div className="space-y-2">
                    {newTransport.departureTimes.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleDepartureTimeChange(index, e.target.value)}
                          className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                          required
                        />
                        {newTransport.departureTimes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDepartureTime(index)}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 hover:bg-red-500/20 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddDepartureTime}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Another Time
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Fare (₹) *
                    </label>
                    <input
                      type="number"
                      value={newTransport.fare}
                      onChange={(e) => setNewTransport({ ...newTransport, fare: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Contact Info
                    </label>
                    <input
                      type="text"
                      value={newTransport.contactInfo}
                      onChange={(e) => setNewTransport({ ...newTransport, contactInfo: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none"
                      placeholder="Phone or email"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddTransport(false)}
                    disabled={submittingTransport}
                    className="flex-1 rounded-xl border border-white/10 bg-slate-800 px-6 py-3 text-white hover:bg-slate-700 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTransport}
                    className="flex-1 rounded-xl bg-purple-600 px-6 py-3 text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submittingTransport ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Transport Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrganizationDashboard;

