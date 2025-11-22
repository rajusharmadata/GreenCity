import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Hash, Mail, Phone, ShieldCheck, Loader2, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';

function AdminSignupPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();
  const { signup } = useAuth();
  const { success, error: showError } = useNotification();
  const password = watch('password');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Admin signup uses firstName, lastName, username, email, password
      const result = await signup(
        {
          firstName: data.firstName || data.organizationName?.split(' ')[0] || 'Admin',
          lastName: data.lastName || data.organizationName?.split(' ').slice(1).join(' ') || 'User',
          username: data.username || data.email?.split('@')[0] || `admin_${Date.now()}`,
          email: data.email,
          password: data.password
        },
        'admin'
      );

      if (result) {
        success('Admin account created successfully!');
        setTimeout(() => navigate('/login/admin'), 1400);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyles =
    'w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 sm:px-6 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.25),_transparent_45%)]" />
      <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.25),_transparent_50%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500 via-sky-500 to-indigo-600 p-10 text-white shadow-2xl shadow-emerald-900/30 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 text-white/80">
            <div className="rounded-2xl bg-white/15 p-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.25em]">GreenCity</p>
              <p className="text-base">Trusted climate partners</p>
            </div>
          </div>

          <h1 className="mt-8 text-4xl font-bold leading-tight">
            Register your organization and unlock climate-ready tooling.
          </h1>

          <ul className="mt-10 space-y-6 text-sm">
            {[
              'Secure admin console to manage transport entries and impact reports.',
              'Priority access to issue escalations submitted by the community.',
              'Real-time dashboards for eco-points and compliance readiness.'
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-white/90">
                <Sparkles className="mt-1 h-5 w-5 text-amber-200" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto rounded-2xl bg-white/10 p-5 shadow-inner shadow-black/25 backdrop-blur-md">
            <p className="text-sm uppercase tracking-wide text-white/70">Need help?</p>
            <p className="text-lg font-semibold text-white">
              team@greencity.gov • +91 88009 44556
            </p>
            <p className="text-sm text-white/70">24/7 priority onboarding support</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              System Administrator
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Create admin account</h2>
            <p className="text-sm text-slate-500">
              All credentials are encrypted at rest. Your details are used only for verification and
              internal compliance workflows.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                First Name*
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className={`${fieldStyles} pl-10`}
                    placeholder="John"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                </div>
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName.message}</p>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                Last Name*
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className={`${fieldStyles} pl-10`}
                    placeholder="Doe"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName.message}</p>
                )}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                Username*
                <div className="relative">
                  <Hash className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className={`${fieldStyles} pl-10`}
                    placeholder="johndoe"
                    {...register('username', { required: 'Username is required' })}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username.message}</p>
                )}
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                Email*
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    className={`${fieldStyles} pl-10`}
                    placeholder="admin@greencity.gov"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Provide a valid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium text-slate-700">
                Password*
                <input
                  type="password"
                  className={fieldStyles}
                  placeholder="Minimum 8 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' }
                  })}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </label>

              <label className="space-y-1 text-sm font-medium text-slate-700">
                Confirm password*
                <input
                  type="password"
                  className={fieldStyles}
                  placeholder="Re-enter password"
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === password || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                )}
              </label>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span>
                By continuing you agree to our{' '}
                <button type="button" className="font-semibold text-emerald-500">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="font-semibold text-emerald-500">
                  Privacy Policy
                </button>
                .
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create admin account'
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default AdminSignupPage;
