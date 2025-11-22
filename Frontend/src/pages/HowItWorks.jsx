import React from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Send, 
  Eye, 
  Trophy, 
  BarChart3, 
  Users, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: Camera,
    title: 'Spot an Issue',
    description: 'Found a garbage dump, pothole, broken light, or any civic issue? Just open the app and capture it with a photo.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    number: 2,
    icon: Send,
    title: 'Report Instantly',
    description: 'Submit your report with a short description and location. It only takes a few seconds to make a difference!',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    number: 3,
    icon: Eye,
    title: 'Track & Monitor',
    description: 'Monitor the status of your report in real-time and get notified when it\'s resolved by the concerned authority.',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-200',
  },
  {
    number: 4,
    icon: Trophy,
    title: 'Earn Green Points',
    description: 'Every report you submit adds to your community score. Get rewarded with points for being an active citizen!',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    number: 5,
    icon: BarChart3,
    title: 'View City Progress',
    description: 'Analyze how your neighborhood and city are improving with real-time stats, analytics, and progress tracking.',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    iconColor: 'text-teal-600',
    borderColor: 'border-teal-200',
  },
  {
    number: 6,
    icon: Users,
    title: 'Collaborate',
    description: 'Work with others, take part in green challenges, and make a real difference together as a community.',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-200',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Report issues in seconds with our streamlined process',
    color: 'text-yellow-500',
  },
  {
    icon: Target,
    title: 'Precise Location',
    description: 'Pinpoint exact locations with GPS integration',
    color: 'text-blue-500',
  },
  {
    icon: TrendingUp,
    title: 'Real-time Updates',
    description: 'Get instant notifications on issue status changes',
    color: 'text-green-500',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Solutions',
    description: 'All resolved issues are verified before closing',
    color: 'text-emerald-500',
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-blue-50/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-blue-600">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 sm:pt-28 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Simple & Effective</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              How GreenCity
              <span className="block text-emerald-200">Works</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 max-w-3xl mx-auto">
              Making your city cleaner and greener is just a few taps away. Follow these simple steps to start making a difference today.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Connecting Line (for desktop 3-column layout) */}
                {index < steps.length - 1 && (index + 1) % 3 !== 0 && (
                  <div className="hidden lg:block absolute top-16 left-full w-8 h-0.5 bg-gradient-to-r from-emerald-300 to-transparent z-0" />
                )}

                <div className={`relative h-full bg-white rounded-2xl border-2 ${step.borderColor} p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-emerald-400`}>
                  {/* Step Number Badge */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow Indicator */}
                  <div className="mt-6 flex items-center text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-semibold">Learn more</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Why Choose GreenCity?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We've built the platform with your convenience and the environment in mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl hover:bg-slate-50 transition-colors duration-300"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-slate-100 mb-4">
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-emerald-50 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens who are already making their cities cleaner and greener.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/register/user"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="/report-issue"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border-2 border-white/30"
              >
                Report an Issue
                <MapPin className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
