import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../../config/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../features/auth/context/authcontext';
import { useNotification } from '../../../context/NotificationContext';
import { API_ENDPOINTS } from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import {
  FiMapPin,
  FiTarget,
  FiLoader,
  FiUpload,
  FiCamera,
  FiAlertTriangle,
  FiCheckCircle,
  FiFileText,
  FiClock,
  FiX,
  FiInfo,
  FiZap,
  FiShield,
  FiDroplets,
  FiWind,
  FiTrash2,
  FiArrowRight,
  FiActivity
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

const issueCategories = [
  { id: 'pollution', name: 'Air/Water Pollution', icon: FiWind, color: 'text-blue-400', description: 'Air quality issues, water contamination' },
  { id: 'waste', name: 'Waste Management', icon: FiTrash2, color: 'text-amber-500', description: 'Illegal dumping, garbage accumulation' },
  { id: 'deforestation', name: 'Deforestation', icon: FaLeaf, color: 'text-emerald-500', description: 'Illegal tree cutting, forest damage' },
  { id: 'water', name: 'Water Stability', icon: FiDroplets, color: 'text-cyan-400', description: 'Water pollution, drainage problems' },
  { id: 'noise', name: 'Sonic Pollution', icon: FiActivity, color: 'text-purple-400', description: 'Excessive noise, sound pollution' },
  { id: 'other', name: 'Anomaly Cluster', icon: FiAlertTriangle, color: 'text-red-400', description: 'Other environmental concerns' }
];

const priorityLevels = [
  { id: 'low', name: 'Priority Gamma', description: 'Minor issue, no immediate danger', color: 'text-emerald-500' },
  { id: 'medium', name: 'Priority Beta', description: 'Requires attention', color: 'text-amber-500' },
  { id: 'high', name: 'Priority Alpha', description: 'Urgent, immediate action needed', color: 'text-red-500' }
];

function ReportIssue() {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const watchedCategory = watch('category');
  const watchedPriority = watch('priority');

  useEffect(() => {
    if (watchedCategory) {
      setSelectedCategory(watchedCategory);
    }
    if (watchedPriority) {
      setSelectedPriority(watchedPriority);
    }
  }, [watchedCategory, watchedPriority]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'User-Agent': 'GreenCityApp/1.0' } }
          );
          if (!response.ok) throw new Error('Failed to fetch address');
          const data = await response.json();
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setCurrentLocation(address);
          setValue('location', address);
        } catch (err) {
          setValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        showError('Failed to get your location. Please enter manually.');
        setLocationLoading(false);
      }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
    setValue('image', null);
  };

  const onSubmitStep1 = (data) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const finalData = { ...formData, ...data, username: user.username };
      const formDataToSend = new FormData();
      formDataToSend.append('username', finalData.username);
      formDataToSend.append('title', finalData.title);
      formDataToSend.append('description', finalData.description);
      formDataToSend.append('location', finalData.location);
      if (imageFile) formDataToSend.append('image', imageFile);

      const response = await axiosInstance.post(API_ENDPOINTS.REPORT_ISSUE, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data) {
        success('Intelligence logged successfully. +50 Merit Points.');
        reset();
        setImage(null);
        setImageFile(null);
        setCurrentLocation('');
        setStep(1);
        setFormData({});
        setTimeout(() => navigate('/user-dashboard'), 2000);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Transmission error. Retry uplink.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030d0a] text-slate-200 selection:bg-emerald-500/20">
      <div className="container mx-auto px-6 pt-48 pb-24 max-w-5xl">

        {/* ─── HEADER ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <FiShield className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 font-mono">Operations Directive v9.4</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 leading-none" style={{ fontFamily: 'Outfit' }}>
            Anomaly <br />
            <span className="text-emerald-500 italic">Ingress.</span>
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto" style={{ fontFamily: 'Inter' }}>
            Initialize high-fidelity intelligence reporting for localized environmental anomalies.
          </p>

          {/* Progress Tracker */}
          <div className="flex items-center justify-center mt-12 gap-6">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${step >= 1 ? 'bg-white/5 border border-emerald-500/30' : 'bg-white/[0.02] text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${step >= 1 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 opacity-40'}`}>01</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Primary Intel</span>
            </div>
            <div className="w-12 h-px bg-white/10" />
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${step >= 2 ? 'bg-white/5 border border-emerald-500/30' : 'bg-white/[0.02] text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${step >= 2 ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-white/5 opacity-40'}`}>02</div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Geospatial Sync</span>
            </div>
          </div>
        </motion.div>

        {/* ─── FORM CONTENT ─── */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bio-card p-12 lg:p-16 border-white/5"
              >
                <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-12">
                  <div className="space-y-10">
                    <h2 className="text-2xl font-bold flex items-center gap-4 text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                      <FiFileText className="w-6 h-6 text-emerald-500" />
                      Manifest Declaration
                    </h2>

                    {/* Category Selection */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono ml-1">Select Anomaly Profile</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {issueCategories.map((category) => {
                          const Icon = category.icon;
                          const isActive = selectedCategory === category.id;
                          return (
                            <motion.div
                              key={category.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => {
                                setSelectedCategory(category.id);
                                setValue('category', category.id);
                              }}
                              className={`relative cursor-pointer rounded-2xl border-2 p-8 transition-all duration-500 flex flex-col items-center text-center gap-4 ${isActive
                                ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[inner_0_0_20px_rgba(16,185,129,0.1)]'
                                : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                }`}
                            >
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-500 text-black shadow-lg' : 'bg-white/5 text-slate-500'}`}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <div>
                                <span className={`block font-black text-[10px] uppercase tracking-widest font-mono ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>{category.name}</span>
                              </div>
                              {isActive && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono ml-1">Designated Header</label>
                        <input
                          type="text"
                          {...register('title', { required: true })}
                          className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-inter"
                          placeholder="Localized anomaly tag..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono ml-1">Impact Narrative</label>
                        <textarea
                          {...register('description', { required: true, minLength: 20 })}
                          rows={6}
                          className="w-full bg-white/[0.03] border-2 border-white/5 rounded-2xl px-8 py-5 text-sm font-medium text-slate-300 outline-none focus:border-emerald-500/20 transition-all font-inter resize-none"
                          placeholder="Comprehensive log of visual/environmental data..."
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono ml-1">Criticality Weight</label>
                      <div className="grid grid-cols-3 gap-6">
                        {priorityLevels.map((p) => {
                          const isActive = selectedPriority === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedPriority(p.id);
                                setValue('priority', p.id);
                              }}
                              className={`py-4 rounded-xl border-2 font-mono text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-white/5 bg-white/[0.02] text-slate-500'}`}
                            >
                              {p.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex justify-end">
                    <button
                      type="submit"
                      className="group flex items-center gap-4 px-12 py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all"
                    >
                      Initialize Deployment
                      <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bio-card p-12 lg:p-16 border-white/5"
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                  <h2 className="text-2xl font-bold flex items-center gap-4 text-white uppercase tracking-tight" style={{ fontFamily: 'Outfit' }}>
                    <FiMapPin className="w-6 h-6 text-emerald-500" />
                    Coordinate Calibration
                  </h2>

                  <div className="space-y-10">
                    {/* Location */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono ml-1">Geometric Telemetry</label>
                      <div className="flex gap-4">
                        <div className="relative flex-1 group">
                          <FiMapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500 h-5 w-5" />
                          <input
                            type="text"
                            {...register('location', { required: true })}
                            value={currentLocation}
                            onChange={(e) => {
                              setCurrentLocation(e.target.value);
                              setValue('location', e.target.value);
                            }}
                            className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border-2 border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:border-emerald-500/20 transition-all font-inter"
                            placeholder="Awaiting sensor data..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:opacity-40 shadow-inner"
                        >
                          {locationLoading ? <FiLoader className="w-6 h-6 animate-spin text-emerald-500" /> : <FiTarget className="w-6 h-6" />}
                        </button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono ml-1">Evidence Acquisition</label>
                      <div className={`relative border-2 border-dashed rounded-[3rem] transition-all duration-700 overflow-hidden ${image ? 'border-emerald-500/30' : 'border-white/10 bg-white/[0.01] hover:bg-white/[0.03] p-16'}`}>
                        {image ? (
                          <div className="relative group">
                            <img src={image} alt="Preview" className="w-full h-96 object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center justify-center">
                              <button
                                type="button"
                                onClick={removeImage}
                                className="w-16 h-16 rounded-2xl bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                              >
                                <FiX className="w-8 h-8" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-8 animate-pulse">
                              <FiCamera className="w-8 h-8" />
                            </div>
                            <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono mb-2">Initialize Optical Sensor</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Permissible data: PNG / JPG up to 5MB</p>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="upload-artifact" />
                            <label
                              htmlFor="upload-artifact"
                              className="mt-10 inline-flex px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-white/10 transition-all font-mono"
                            >
                              Sync Artifact
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex gap-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-8 py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-slate-400 font-black uppercase text-[10px] tracking-widest font-mono hover:text-white transition-all"
                    >
                      Rewind Protocol
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-4 py-5 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_0_40px_rgba(16,185,129,0.3)] disabled:opacity-40"
                    >
                      {loading ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiZap className="w-5 h-5" />}
                      Sync With Operations
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: FiShield, title: 'Uplink Integrity', desc: 'Secure data routing to municipal cloud.' },
            { icon: FiAward, title: 'Merit Gain', desc: '+50 points upon incident verification.' },
            { icon: FiClock, title: 'Network Pulse', desc: 'Typical resolution estimated 48-72h.' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bio-card p-10 border-white/5 group hover:border-emerald-500/20"
            >
              <item.icon className="w-6 h-6 text-emerald-500 mb-6 group-hover:scale-125 transition-transform" />
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest font-mono mb-4">{item.title}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
