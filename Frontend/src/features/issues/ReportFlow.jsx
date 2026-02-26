import React, { useReducer, useRef, useCallback, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, MapPin, Loader2, Check, Zap, ArrowRight, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '../../config/axios';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../auth/context/authcontext';
import { useIssues } from '../../context/IssuesContext';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
    bg: '#030d0a',
    surface: 'rgba(10,30,20,0.65)',
    accent: '#34d399',
    cyan: '#22d3ee',
    warn: '#facc15',
    danger: '#f87171',
    text: '#e2fdf4',
    muted: 'rgba(148,163,184,0.7)',
    border: 'rgba(52,211,153,0.15)',
    card: 'rgba(10,30,20,0.6)',
};

const CATEGORIES = [
    { id: 'Waste', emoji: '🗑️', label: 'Waste' },
    { id: 'Infrastructure', emoji: '🏗️', label: 'Infrastructure' },
    { id: 'Road Hazard', emoji: '⚠️', label: 'Road Hazard' },
    { id: 'Vandalism', emoji: '🎨', label: 'Vandalism' },
    { id: 'Air Quality', emoji: '💨', label: 'Air Quality' },
    { id: 'Water', emoji: '💧', label: 'Water' },
    { id: 'Noise', emoji: '🔊', label: 'Noise' },
    { id: 'Other', emoji: '📌', label: 'Other' },
];

// ─── Reducer ──────────────────────────────────────────────────────────────────
const initialState = {
    step: 1,
    image: null,
    imagePreviewUrl: null,
    title: '',
    category: '',
    description: '',
    address: '',
    coords: null,
    isSubmitting: false,
    error: null,
    fieldErrors: {},
    submittedIssue: null,
};

function reducer(state, action) {
    switch (action.type) {
        case 'SET_STEP': return { ...state, step: action.step };
        case 'SET_IMAGE': return { ...state, image: action.file, imagePreviewUrl: action.url };
        case 'CLEAR_IMAGE': return { ...state, image: null, imagePreviewUrl: null };
        case 'SET_FIELD': return { ...state, [action.field]: action.value, fieldErrors: { ...state.fieldErrors, [action.field]: undefined } };
        case 'SET_ERRORS': return { ...state, fieldErrors: action.errors };
        case 'SUBMITTING': return { ...state, isSubmitting: true, error: null };
        case 'SUBMIT_SUCCESS': return { ...state, isSubmitting: false, submittedIssue: action.issue };
        case 'SUBMIT_ERROR': return { ...state, isSubmitting: false, error: action.msg };
        case 'RESET': return { ...initialState };
        default: return state;
    }
}

// ─── Components ───────────────────────────────────────────────────────────────

const StepIndicator = ({ step }) => {
    return (
        <div className="fixed top-24 left-0 right-0 z-50 px-8 py-4 flex flex-col items-center">
            <div className="relative w-full max-w-xs h-0.5 bg-white/5 mb-6">
                <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
                    className="absolute h-full bg-[#34d399]"
                />
                <div className="absolute inset-0 flex justify-between -top-2.5">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="relative flex flex-col items-center">
                            <motion.div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${step >= s ? 'bg-[#34d399] border-[#34d399]' : 'bg-[#030d0a] border-white/10'
                                    }`}
                                animate={{ scale: step === s ? 1.2 : 1 }}
                            >
                                {step > s ? (
                                    <Check className="w-3.5 h-3.5 text-[#030d0a]" strokeWidth={4} />
                                ) : (
                                    <span className={`text-[10px] font-black ${step >= s ? 'text-[#030d0a]' : 'text-white/40'}`}>
                                        {s}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SuccessState = ({ issue, onReset }) => {
    const navigate = useNavigate();
    const newId = issue?._id || issue?.id;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] bg-[#030d0a] flex flex-col items-center justify-center p-8 text-center"
        >
            <div className="relative mb-12">
                <AnimatedCheck />
                <Confetti />
            </div>

            <h2 className="text-5xl font-black text-white font-syne uppercase tracking-tighter mb-4">
                Report Deployed!
            </h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-12 shadow-2xl shadow-emerald-500/5"
            >
                <Zap className="text-emerald-400 w-5 h-5 fill-emerald-400" />
                <span className="text-emerald-400 font-black uppercase tracking-widest text-sm">
                    You earned +50 eco points
                </span>
            </motion.div>

            <div className="flex flex-col w-full max-w-xs gap-4">
                <button
                    onClick={() => navigate(`/issues/${newId}`)}
                    className="w-full py-5 rounded-2xl bg-emerald-400 text-[#030d0a] font-black uppercase tracking-widest text-xs hover:bg-emerald-300 transition-colors shadow-2xl shadow-emerald-500/20"
                >
                    Track This Report
                </button>
                <button
                    onClick={onReset}
                    className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors"
                >
                    Report Another
                </button>
            </div>
        </motion.div>
    );
};

const AnimatedCheck = () => (
    <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="58" fill="transparent" stroke="#34d399" strokeWidth="4" className="opacity-20" />
        <motion.path
            d="M35 60 L52 77 L85 43"
            fill="transparent"
            stroke="#34d399"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
        />
    </svg>
);

const Confetti = () => {
    const dots = Array.from({ length: 20 });
    return (
        <div className="absolute inset-0 pointer-events-none">
            {dots.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: i % 3 === 0 ? '#34d399' : i % 3 === 1 ? '#22d3ee' : '#facc15',
                        left: '50%',
                        top: '50%'
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                        scale: [0, 1, 0],
                        x: (Math.random() - 0.5) * 400,
                        y: (Math.random() - 0.5) * 400,
                        rotate: Math.random() * 360
                    }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.3
                    }}
                />
            ))}
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportFlow() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const navigate = useNavigate();
    const { refresh } = useIssues();
    const { user } = useAuth();

    // Step 1 Refs
    const fileRef = useRef(null);
    const cameraRef = useRef(null);

    // Step 2 Local State
    const [locLoading, setLocLoading] = useState(false);

    const handleImage = (e, isCapture = false) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            dispatch({ type: 'SET_IMAGE', file, url });
        }
    };

    const handleLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lon } = pos.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                    const data = await res.json();
                    const address = data.display_name.slice(0, 60);
                    dispatch({ type: 'SET_FIELD', field: 'address', value: address });
                    dispatch({ type: 'SET_FIELD', field: 'coords', value: { lat, lon } });
                } catch (err) {
                    alert('Location unavailable. Please type your address.');
                } finally {
                    setLocLoading(false);
                }
            },
            () => {
                alert('Location unavailable. Please type your address.');
                setLocLoading(false);
            }
        );
    };

    const validateStep2 = () => {
        const errors = {};
        if (state.title.length < 5) errors.title = 'Title must be 5+ characters';
        if (!state.category) errors.category = 'Select a category';
        if (state.description.length < 10) errors.description = 'Description must be 10+ characters';
        if (!state.address) errors.address = 'Location required';

        if (Object.keys(errors).length > 0) {
            dispatch({ type: 'SET_ERRORS', errors });
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        dispatch({ type: 'SUBMITTING' });
        try {
            const fd = new FormData();
            if (state.image) fd.append('image', state.image);
            fd.append('title', state.title);
            fd.append('category', state.category);
            fd.append('description', state.description);
            fd.append('location', state.address);
            if (state.coords) fd.append('coords', JSON.stringify(state.coords));

            const res = await axiosInstance.post(API_ENDPOINTS.REPORT_ISSUE, fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            refresh();
            dispatch({ type: 'SUBMIT_SUCCESS', issue: res.data });
        } catch (err) {
            dispatch({ type: 'SUBMIT_ERROR', msg: 'Submission failed. Please try again.' });
        }
    };

    if (state.submittedIssue) {
        return <SuccessState issue={state.submittedIssue} onReset={() => dispatch({ type: 'RESET' })} />;
    }

    return (
        <div className="min-h-screen bg-[#030d0a] text-white flex flex-col font-inter">
            <StepIndicator step={state.step} />

            <div className="flex-1 flex flex-col pt-44 px-6 pb-12">
                <AnimatePresence mode="wait">
                    {state.step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center -mt-12"
                        >
                            <div
                                onClick={() => cameraRef.current.click()}
                                className="relative w-64 h-64 border-2 border-dashed border-emerald-500/30 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 transition-colors group mb-8"
                            >
                                {state.imagePreviewUrl ? (
                                    <>
                                        <img src={state.imagePreviewUrl} className="w-full h-full object-cover rounded-[2.3rem]" alt="Preview" />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLEAR_IMAGE' }); }}
                                            className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center shadow-xl"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Camera className="w-12 h-12 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-emerald-100/40 text-xs font-bold uppercase tracking-widest text-center px-8">
                                            Tap to photograph the issue
                                        </span>
                                    </>
                                )}
                            </div>

                            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleImage(e, true)} />
                            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />

                            {!state.imagePreviewUrl && (
                                <div className="mb-12">
                                    <span className="text-white/20 text-[10px] uppercase font-black tracking-widest block text-center mb-2">or</span>
                                    <button
                                        onClick={() => fileRef.current.click()}
                                        className="text-emerald-400 font-bold text-sm underline underline-offset-8"
                                    >
                                        Choose from library
                                    </button>
                                </div>
                            )}

                            <div className="w-full max-w-sm mt-auto">
                                <button
                                    disabled={!state.imagePreviewUrl}
                                    onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
                                    className="w-full py-5 rounded-2xl bg-emerald-400 text-[#030d0a] font-black uppercase tracking-widest text-xs disabled:opacity-20 disabled:grayscale transition-all shadow-2xl shadow-emerald-500/20 mb-6"
                                >
                                    Next Step
                                </button>
                                <button
                                    onClick={() => { dispatch({ type: 'CLEAR_IMAGE' }); dispatch({ type: 'SET_STEP', step: 2 }); }}
                                    className="w-full text-white/20 font-black uppercase tracking-[0.2em] text-[10px]"
                                >
                                    Skip Phase
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {state.step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-emerald-100/30">Issue Title</label>
                                    <span className="text-[10px] font-mono text-white/20">{state.title.length}/80</span>
                                </div>
                                <input
                                    value={state.title}
                                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'title', value: e.target.value })}
                                    maxLength={80}
                                    placeholder="e.g. Broken streetlight on Oak Ave"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/10"
                                />
                                {state.fieldErrors.title && <p className="text-rose-500 text-[10px] font-bold uppercase">{state.fieldErrors.title}</p>}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black tracking-widest text-emerald-100/30">Category</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => dispatch({ type: 'SET_FIELD', field: 'category', value: cat.id })}
                                            className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${state.category === cat.id
                                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                                                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                                                }`}
                                        >
                                            <span className="text-xl">{cat.emoji}</span>
                                            <span className="text-[9px] font-bold uppercase tracking-tight">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {state.fieldErrors.category && <p className="text-rose-500 text-[10px] font-bold uppercase">{state.fieldErrors.category}</p>}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-emerald-100/30">Description</label>
                                    <span className={`text-[10px] font-mono ${state.description.length > 270 ? 'text-rose-500' : 'text-white/20'}`}>
                                        {state.description.length}/300
                                    </span>
                                </div>
                                <textarea
                                    value={state.description}
                                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                                    maxLength={300}
                                    rows={4}
                                    placeholder="Describe the issue in detail..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/10 resize-none"
                                />
                                {state.fieldErrors.description && <p className="text-rose-500 text-[10px] font-bold uppercase">{state.fieldErrors.description}</p>}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] uppercase font-black tracking-widest text-emerald-100/30">Location</label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                        <input
                                            value={state.address}
                                            onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'address', value: e.target.value })}
                                            placeholder="Incident address..."
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/10"
                                        />
                                    </div>
                                    <button
                                        onClick={handleLocation}
                                        disabled={locLoading}
                                        className="px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center justify-center min-w-[56px]"
                                    >
                                        {locLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '📍'}
                                    </button>
                                </div>
                                {state.fieldErrors.address && <p className="text-rose-500 text-[10px] font-bold uppercase">{state.fieldErrors.address}</p>}
                            </div>

                            <button
                                onClick={() => validateStep2() && dispatch({ type: 'SET_STEP', step: 3 })}
                                className="w-full py-5 rounded-2xl bg-emerald-400 text-[#030d0a] font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/20"
                            >
                                Review Report
                            </button>
                        </motion.div>
                    )}

                    {state.step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/5 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex gap-6">
                                    <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/5 overflow-hidden flex-shrink-0">
                                        {state.imagePreviewUrl ? (
                                            <img src={state.imagePreviewUrl} className="w-full h-full object-cover" alt="Thumb" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                                <ImageIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-2xl font-black font-syne uppercase tracking-tight truncate mb-2">{state.title}</h3>
                                        <div className="flex gap-2 items-center mb-2">
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                                {state.category}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-emerald-100/40 font-bold flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> {state.address}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 border-b border-white/5">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-emerald-100/30 block mb-4">Description</label>
                                    <p className="text-sm text-emerald-100/80 leading-relaxed italic">
                                        "{state.description}"
                                    </p>
                                </div>

                                <div className="p-8 bg-emerald-500/5 flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-100/30">Potential Reward</span>
                                    <div className="flex items-center gap-2">
                                        <Zap className="text-emerald-400 w-5 h-5 fill-emerald-400" />
                                        <span className="text-emerald-400 text-xl font-black font-syne">+50 pts</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    disabled={state.isSubmitting}
                                    onClick={handleSubmit}
                                    className="w-full py-6 rounded-[2rem] bg-emerald-400 text-[#030d0a] font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                                    style={{ fontFamily: 'Syne, sans-serif' }}
                                >
                                    {state.isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>Deploy Report 🚀</>
                                    )}
                                </button>
                                <button
                                    disabled={state.isSubmitting}
                                    onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
                                    className="w-full py-4 text-white/20 font-black uppercase tracking-widest text-[10px]"
                                >
                                    Edit Details
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
