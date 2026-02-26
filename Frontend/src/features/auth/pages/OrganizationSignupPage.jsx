import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiActivity,
  FiZap,
  FiCheckCircle,
  FiAlertCircle,
  FiGlobe,
  FiPlus,
  FiTruck,
  FiNavigation
} from 'react-icons/fi';
import { FaLeaf, FaBus, FaTrain, FaCar, FaMotorcycle, FaBicycle } from 'react-icons/fa';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../../../context/NotificationContext';

const initialState = {
  organizationName: '',
  organizationId: '',
  email: '',
  phone: '',
  address: '',
  transportTypes: [],
  password: '',
  confirmPassword: ''
};

const TRANSPORT_OPTIONS = [
  { value: 'Bus', label: 'Bus', icon: <FaBus /> },
  { value: 'Train', label: 'Train', icon: <FaTrain /> },
  { value: 'Metro', label: 'Metro', icon: <FiNavigation /> },
  { value: 'SharedCab', label: 'Shared Cab', icon: <FaCar /> },
  { value: 'Car', label: 'Car/Taxi', icon: <FaCar /> },
  { value: 'Bike', label: 'Bike/Scooter', icon: <FaMotorcycle /> },
  { value: 'Other', label: 'Other', icon: <FaBicycle /> }
];

const OrganizationSignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success: notifySuccess } = useNotification();

  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const sanitizedPhone = useMemo(() => formData.phone.replace(/\D/g, ''), [formData.phone]);

  const handleChange = (event) => {
    const { id, value, type, checked } = event.target;
    if (type === 'checkbox' && id.startsWith('transport-')) {
      const transportType = id.replace('transport-', '');
      setFormData((prev) => ({
        ...prev,
        transportTypes: checked
          ? [...prev.transportTypes, transportType]
          : prev.transportTypes.filter(t => t !== transportType)
      }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
    if (fieldErrors[id]) setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    if (error) setError('');
  };

  const handleBlur = (fieldId) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }));
    validateField(fieldId);
  };

  const validateField = (fieldId) => {
    const errors = { ...fieldErrors };
    switch (fieldId) {
      case 'organizationName':
        if (!formData.organizationName.trim()) errors.organizationName = 'Sector Name Required';
        break;
      case 'organizationId':
        if (!formData.organizationId.trim()) errors.organizationId = 'Registry ID Required';
        break;
      case 'address':
        if (!formData.address.trim()) errors.address = 'Hub Address Required';
        break;
      case 'email':
        if (!formData.email.trim()) errors.email = 'Terminal Email Required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Invalid Cipher';
        break;
      case 'phone':
        if (!sanitizedPhone || sanitizedPhone.length < 10) errors.phone = '10 Digit Uplink Needed';
        break;
      case 'password':
        if (!formData.password) errors.password = 'Auth Key Required';
        else if (formData.password.length < 8) errors.password = '8+ Cipher Required';
        break;
      case 'confirmPassword':
        if (!formData.confirmPassword) errors.confirmPassword = 'Cipher Confirmation Required';
        else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Ciphers Discrepancy';
        break;
      case 'transportTypes':
        if (!formData.transportTypes || formData.transportTypes.length === 0) errors.transportTypes = 'Select 1+ Vector';
        break;
    }
    setFieldErrors(errors);
    return !errors[fieldId];
  };

  const validateForm = () => {
    const fields = ['organizationName', 'organizationId', 'address', 'email', 'phone', 'transportTypes', 'password', 'confirmPassword'];
    let isValid = true;
    fields.forEach(f => { if (!validateField(f)) isValid = false; });
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');

    try {
      const result = await signup({
        organizationName: formData.organizationName.trim(),
        organizationId: formData.organizationId.trim(),
        address: formData.address.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: Number(sanitizedPhone),
        transportTypes: formData.transportTypes,
        password: formData.password
      }, 'organization');

      if (result?.requiresVerification) {
        notifySuccess('Organization Protocol Initiated. Verification Pending.');
        setTimeout(() => navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim().toLowerCase())}&type=organization`, { replace: true }), 2000);
      } else {
        notifySuccess('Registry Submission Successful. Awaiting Authorization.');
        setTimeout(() => navigate('/login/org', { replace: true }), 2000);
      }
    } catch (err) {
      setError(err.message || 'Registry Interrupted');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030d0a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
        {/* Left Side: Partner Narrative */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-12 space-y-12"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <FiBriefcase className="text-4xl text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Partner Nexus Protocol</p>
              <h1 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>GreenCity <span className="text-emerald-500">Registry</span>.</h1>
            </div>
          </div>

          <h2 className="text-6xl font-black text-white leading-none tracking-tighter font-outfit uppercase">
            Empower Your <br />
            <span className="text-emerald-500 italic">Fleet Ecosystem.</span>
          </h2>

          <div className="space-y-8">
            {[
              { icon: <FiTruck />, title: 'Core Logistics', desc: 'Securely manage and oversee regional bus, train, and electric sectors.' },
              { icon: <FiActivity />, title: 'Sectoral Analytics', desc: 'Real-time carbon telemetry and impact dashboards for your routes.' },
              { icon: <FaLeaf />, title: 'Citizen Engagement', desc: 'Establish direct links with thousands of eco-conscious collective members.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-5 group">
                <div className="mt-1 text-emerald-500 text-2xl group-hover:scale-125 transition-transform">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-widest font-mono mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed" style={{ fontFamily: 'Inter' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bio-card border-emerald-500/10 bg-emerald-500/[0.02]">
            <div className="flex items-center gap-4 mb-6">
              <FiCheckCircle className="text-emerald-500 text-xl" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Verification Status: Active</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium" style={{ fontFamily: 'Inter' }}>
              Organizational enrollment requires sectoral verification. Authorization typically cycles within 24-48 solar hours.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Deployment Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="bio-card border-white/10 p-12 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-12">
              <div className="text-center lg:text-left">
                <h3 className="text-4xl font-black text-white tracking-tighter" style={{ fontFamily: 'Outfit' }}>Organization Registry.</h3>
                <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.3em] font-mono">Official Partner Enrollment Protocol</p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4">
                    <FiAlertCircle className="text-rose-400 text-2xl shrink-0" />
                    <span className="text-[10px] font-black text-rose-200 uppercase tracking-widest font-mono">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Sector 1: Core Registry */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <FiBriefcase className="text-emerald-500 text-xl" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Core Registry</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Official Sector Name</label>
                      <input type="text" id="organizationName" value={formData.organizationName} onChange={handleChange} onBlur={() => handleBlur('organizationName')}
                        className={`w-full bg-white/5 border ${fieldErrors.organizationName ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest`} placeholder="ECO TRANSIT LTD" />
                      {fieldErrors.organizationName && <p className="text-[9px] font-black text-rose-400 px-2 uppercase font-mono">{fieldErrors.organizationName}</p>}
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Registry ID</label>
                      <input type="text" id="organizationId" value={formData.organizationId} onChange={handleChange} onBlur={() => handleBlur('organizationId')}
                        className={`w-full bg-white/5 border ${fieldErrors.organizationId ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest`} placeholder="ORG-778-XP" />
                      {fieldErrors.organizationId && <p className="text-[9px] font-black text-rose-400 px-2 uppercase font-mono">{fieldErrors.organizationId}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Hub Headquarters Address</label>
                    <textarea id="address" value={formData.address} onChange={handleChange} onBlur={() => handleBlur('address')} rows={3}
                      className={`w-full bg-white/5 border ${fieldErrors.address ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all resize-none font-mono uppercase tracking-widest`} placeholder="128 GREEN TECH PLAZA, SECTOR 9" />
                  </div>
                </div>

                {/* Sector 2: Logistics Vectors */}
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <FiTruck className="text-emerald-500 text-xl" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Logistics Vectors</span>
                    </div>
                    {fieldErrors.transportTypes && <span className="text-[9px] font-black text-rose-400 animate-pulse font-mono uppercase tracking-widest">{fieldErrors.transportTypes}</span>}
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {TRANSPORT_OPTIONS.map((opt) => (
                      <label key={opt.value} className={`relative flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all cursor-pointer group ${formData.transportTypes.includes(opt.value) ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xl shadow-emerald-500/10' : 'bg-white/2 border-white/5 hover:border-emerald-500/20'}`}>
                        <input type="checkbox" id={`transport-${opt.value}`} checked={formData.transportTypes.includes(opt.value)} onChange={handleChange} className="hidden" />
                        <span className={`text-3xl transition-transform duration-500 group-hover:scale-110 ${formData.transportTypes.includes(opt.value) ? 'text-emerald-400' : 'text-slate-600'}`}>{opt.icon}</span>
                        <span className={`text-[10px] font-black uppercase tracking-tighter font-mono ${formData.transportTypes.includes(opt.value) ? 'text-white' : 'text-slate-700'}`}>{opt.label}</span>
                        {formData.transportTypes.includes(opt.value) && (
                          <motion.div layoutId="check-org" className="absolute top-4 right-4"><FiCheckCircle className="text-emerald-500 text-xs shadow-[0_0_10px_rgba(16,185,129,0.5)]" /></motion.div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sector 3: Connectivity Terminal */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <FiMail className="text-emerald-500 text-xl" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/60 font-mono">Connectivity Terminal</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Official Terminal Email</label>
                      <input type="email" id="email" value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')}
                        className={`w-full bg-white/5 border ${fieldErrors.email ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono uppercase tracking-widest`} placeholder="LINK@ORG.COM" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Secure Hub Phone</label>
                      <input type="tel" id="phone" value={formData.phone} onChange={handleChange} onBlur={() => handleBlur('phone')}
                        className={`w-full bg-white/5 border ${fieldErrors.phone ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono`} placeholder="+91" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Auth Cipher</label>
                      <div className="relative group">
                        <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                        <input type={showPassword ? 'text' : 'password'} id="password" value={formData.password} onChange={handleChange} onBlur={() => handleBlur('password')}
                          className={`w-full bg-white/5 border ${fieldErrors.password ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono`} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500">
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono px-2">Cipher Confirmation</label>
                      <div className="relative group">
                        <FiLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                        <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} onBlur={() => handleBlur('confirmPassword')}
                          className={`w-full bg-white/5 border ${fieldErrors.confirmPassword ? 'border-rose-500/40' : 'border-white/10'} rounded-2xl py-5 pl-14 pr-12 text-sm text-white focus:outline-none focus:border-emerald-500/30 transition-all font-mono`} placeholder="••••••••" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-emerald-500">
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-12 flex flex-col sm:flex-row gap-8 items-center">
                  <button type="submit" disabled={loading}
                    className="group w-full sm:flex-[2] py-6 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-[0.4em] text-[11px] font-mono hover:bg-emerald-400 active:scale-98 transition-all shadow-[0_0_40px_rgba(16,185,129,0.2)] disabled:opacity-50 flex items-center justify-center gap-4"
                  >
                    {loading ? <FiActivity className="animate-spin text-xl" /> : <><FiShield className="text-xl" /> Initialize Enrollment</>}
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <Link to="/login/org" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-emerald-500 transition-colors font-mono underline decoration-white/5 underline-offset-8">Portal Login</Link>
                </div>
              </form>

              <div className="pt-12 border-t border-white/5 flex flex-wrap justify-between gap-8 opacity-20">
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] font-mono text-white"><FiCheckCircle /> AES-256 Validated</div>
                <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] font-mono text-white"><FiGlobe /> High Frequency Hub</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrganizationSignupPage;
