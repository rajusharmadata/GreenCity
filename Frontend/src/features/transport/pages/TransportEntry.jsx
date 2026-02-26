import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin,
  FiClock,
  FiActivity,
  FiPlus,
  FiZap,
  FiShield,
  FiCheckCircle,
  FiInfo,
  FiCreditCard,
  FiDollarSign,
  FiChevronRight
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';
import { useAuth } from '../../../features/auth/context/authcontext';
import { useNotification } from '../../../context/NotificationContext';

const transportTypes = [
  { id: 'bus', name: 'Bus', icon: '🚌', description: 'Electric Rapid Transit', ecoScore: 8 },
  { id: 'train', name: 'Train', icon: '🚂', description: 'Intercity Rail Node', ecoScore: 9 },
  { id: 'metro', name: 'Metro', icon: '🚇', description: 'Underground Network', ecoScore: 9 },
  { id: 'shared_cab', name: 'Shared Cab', icon: '🚗', description: 'EV Ride Sharing', ecoScore: 6 },
  { id: 'bike', name: 'Bicycle', icon: '🚲', description: 'Public Bike Share', ecoScore: 10 },
  { id: 'other', name: 'Other', icon: '⚡', description: 'Adaptive Modality', ecoScore: 7 }
];

const frequencyOptions = [
  { id: 'daily', name: 'Daily', description: 'Continuum' },
  { id: 'weekly', name: 'Weekly', description: 'Periodic' },
  { id: 'weekdays', name: 'Weekdays', description: 'Operations' },
  { id: 'weekends', name: 'Weekends', description: 'Off-peak' },
  { id: 'custom', name: 'Custom', description: 'Variable' }
];

function TransportEntry() {
  const { currentUser } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [departureTimes, setDepartureTimes] = useState(['']);
  const [selectedTransport, setSelectedTransport] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [calculatedEcoPoints, setCalculatedEcoPoints] = useState(0);

  const watchedTransport = watch('transportType');
  const watchedFrequency = watch('frequency');

  useEffect(() => {
    if (watchedTransport) {
      setSelectedTransport(watchedTransport);
      calculateEcoPoints(watchedTransport, watchedFrequency);
    }
    if (watchedFrequency) {
      setSelectedFrequency(watchedFrequency);
      calculateEcoPoints(watchedTransport, watchedFrequency);
    }
  }, [watchedTransport, watchedFrequency]);

  const calculateEcoPoints = (transportType, frequency) => {
    const transport = transportTypes.find(t => t.id === transportType);
    if (!transport) return;
    let basePoints = transport.ecoScore * 10;
    const frequencyMultipliers = { daily: 1.5, weekly: 1.2, weekdays: 1.3, weekends: 1.1, custom: 1.0 };
    const multiplier = frequencyMultipliers[frequency] || 1.0;
    setCalculatedEcoPoints(Math.round(basePoints * multiplier));
  };

  const addDepartureTime = () => setDepartureTimes([...departureTimes, '']);
  const removeDepartureTime = (index) => setDepartureTimes(departureTimes.filter((_, i) => i !== index));
  const updateDepartureTime = (index, value) => {
    const newTimes = [...departureTimes];
    newTimes[index] = value;
    setDepartureTimes(newTimes);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const validDepartureTimes = departureTimes.filter(time => time.trim() !== '');
      if (validDepartureTimes.length === 0) {
        showError('Please add at least one departure time slot.');
        setLoading(false);
        return;
      }

      const payload = {
        agencyName: data.agencyName,
        transportType: selectedTransport,
        from: data.from,
        to: data.to,
        departureTimes: validDepartureTimes,
        frequency: selectedFrequency,
        fare: parseFloat(data.fare),
        contactInfo: data.contactInfo || 'Not provided',
        userId: currentUser?._id
      };

      const response = await axiosInstance.post(API_ENDPOINTS.TRANSPORT_ENTRY, payload);
      if (response.data) {
        success(`Telemetry localized. Impact Quotient increased by ${calculatedEcoPoints}.`);
        reset();
        setDepartureTimes(['']);
        setSelectedTransport('');
        setSelectedFrequency('daily');
        setCalculatedEcoPoints(0);
        setTimeout(() => navigate('/user-dashboard'), 2000);
      }
    } catch (err) {
      console.error('Data ingress failed:', err);
      showError(err.response?.data?.message || 'Downlink unstable. Entry cancelled.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200">
      <div className="container mx-auto px-6 py-32 max-w-5xl">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-12 h-[1px] bg-emerald-500/40" />
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Infrastructure Ingress — Node Alpha</p>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 leading-none" style={{ fontFamily: 'Outfit' }}>
            Register New <br />
            <span className="text-emerald-500 italic">Transport.</span>
          </h1>
          <p className="text-lg text-slate-400 font-medium max-w-2xl" style={{ fontFamily: 'Inter' }}>
            Contribute to the collective intelligence of GreenCity. Localize new transport vectors
            to optimize community transit and gain impact merit.
          </p>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bio-card p-10 lg:p-16"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-16">

            {/* Transport Type */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <FiActivity className="text-emerald-500 w-5 h-5" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Select Modality</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {transportTypes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setValue('transportType', t.id)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-500 text-left group ${selectedTransport === t.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-xl shadow-emerald-500/5'
                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                      }`}
                  >
                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{t.icon}</div>
                    <p className="font-bold uppercase tracking-tight text-sm mb-1">{t.name}</p>
                    <p className="text-[10px] font-medium opacity-60 font-mono uppercase truncate">{t.description}</p>
                  </button>
                ))}
              </div>
              {errors.transportType && <p className="mt-4 text-[10px] font-bold text-red-500 uppercase font-mono">{errors.transportType.message}</p>}
            </section>

            {/* Route Details */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <FiMapPin className="text-emerald-500 w-5 h-5" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Vector Telemetry</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Agency Designation</label>
                  <input
                    type="text"
                    {...register('agencyName', { required: 'Designation required' })}
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all"
                    placeholder="e.g. City Rail Network"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Unit Fare (₹)</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
                    <input
                      type="number"
                      step="1"
                      {...register('fare', { required: 'Fare required', min: 0 })}
                      className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl pl-12 pr-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Origin Node</label>
                  <input
                    type="text"
                    {...register('from', { required: 'Origin required' })}
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all"
                    placeholder="Starting waypoint"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Terminal Node</label>
                  <input
                    type="text"
                    {...register('to', { required: 'Terminal required' })}
                    className="w-full bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all"
                    placeholder="Ending waypoint"
                  />
                </div>
              </div>
            </section>

            {/* Schedule */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <FiClock className="text-emerald-500 w-5 h-5" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Cycle Protocols</h2>
              </div>
              <div className="mb-8">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono mb-4 ml-1">Network Frequency</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {frequencyOptions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setValue('frequency', f.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-500 text-center ${selectedFrequency === f.id
                          ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                          : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                        }`}
                    >
                      <p className="text-[10px] uppercase tracking-tighter">{f.name}</p>
                      <p className={`text-[8px] uppercase tracking-widest font-mono mt-1 ${selectedFrequency === f.id ? 'text-black/60' : 'text-slate-600'}`}>{f.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono ml-1">Departure Slots</p>
                {departureTimes.map((time, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateDepartureTime(index, e.target.value)}
                      className="flex-1 bg-white/[0.03] border-2 border-white/5 rounded-xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all"
                    />
                    {departureTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDepartureTime(index)}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <HiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDepartureTime}
                  className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold font-mono text-[10px] uppercase tracking-widest px-1 py-4"
                >
                  <FiPlus className="w-4 h-4" /> Add Logic Packet
                </button>
              </div>
            </section>

            {/* Verification & Submit */}
            <div className="space-y-12">
              {calculatedEcoPoints > 0 && (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FiZap className="w-8 h-8 text-amber-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>Impact Forecast</h3>
                      <p className="text-[10px] font-medium text-emerald-500/60 uppercase tracking-widest font-mono">Merit gain estimated upon node synchronization.</p>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-emerald-400 tracking-tighter" style={{ fontFamily: 'Outfit' }}>+{calculatedEcoPoints}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 group flex items-center justify-center gap-4 bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  {loading ? <FiRefreshCw className="animate-spin w-5 h-5" /> : <FiCheckCircle className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                  Submit Vector Data
                </button>
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-12 py-5 rounded-2xl bg-white/5 border-2 border-white/5 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10 hover:text-white transition-all font-mono"
                >
                  Clear Buffer
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Info Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FiShield, title: 'Verified Grid', sub: 'All transport packets are validated by district nodes.' },
            { icon: FaLeaf, title: 'Eco-Systemic', sub: 'Calculated impact data for global carbon metrics.' },
            { icon: FiInfo, title: 'Community Data', sub: 'Your input optimizes the collective transit grid.' }
          ].map((info, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bio-card p-8 group hover:border-emerald-500/30 transition-all"
            >
              <info.icon className="w-8 h-8 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-2" style={{ fontFamily: 'Outfit' }}>{info.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed" style={{ fontFamily: 'Inter' }}>{info.sub}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default TransportEntry;
