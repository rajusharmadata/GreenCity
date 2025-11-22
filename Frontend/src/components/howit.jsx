import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Leaf, 
  Globe, 
  Award,
  ArrowRight,
  Sparkles,
  Users,
  Zap,
  Target
} from 'lucide-react';

function HowItWorksSection() {
  const steps = [
    {
      icon: CheckCircle,
      title: 'Sign Up',
      description: 'Create your account as a user or organization admin',
      color: 'from-emerald-500 to-cyan-500',
      delay: 0.1
    },
    {
      icon: Leaf,
      title: 'Explore Projects',
      description: 'Discover eco-friendly initiatives and sustainable transport options',
      color: 'from-green-500 to-emerald-500',
      delay: 0.2
    },
    {
      icon: Globe,
      title: 'Contribute',
      description: 'Participate in green activities and track your environmental impact',
      color: 'from-blue-500 to-cyan-500',
      delay: 0.3
    },
    {
      icon: Award,
      title: 'Get Rewarded',
      description: 'Earn eco-points and recognition for your sustainable contributions',
      color: 'from-purple-500 to-pink-500',
      delay: 0.4
    }
  ];

  const benefits = [
    { icon: Users, label: 'Join 10,000+ eco-warriors', color: 'text-emerald-600' },
    { icon: Target, label: 'Track your carbon footprint', color: 'text-blue-600' },
    { icon: Zap, label: 'Smart transport solutions', color: 'text-yellow-600' }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative py-20 px-4 bg-gradient-to-br from-cyan-50 via-emerald-50 to-green-50 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-20 w-64 h-64 bg-cyan-100 rounded-full opacity-20"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-20 w-48 h-48 bg-emerald-100 rounded-full opacity-20"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-medium text-cyan-700">How It Works</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-600 via-emerald-600 to-green-600 bg-clip-text text-transparent">
              Your Journey to Sustainability
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12"
          >
            Join thousands of eco-warriors making a real difference in their communities. 
            Get started in just a few simple steps!
          </motion.p>
        </motion.div>

        {/* Main Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + step.delay }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <div className="h-full bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  {/* Number Badge */}
                  <div className="relative">
                    <div className={`h-2 bg-gradient-to-r ${step.color}`} />
                    <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r ${step.color} text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="p-8 pt-12">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                      className={`w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 mx-auto`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed text-center mb-6">
                      {step.description}
                    </p>

                    {index < steps.length - 1 && (
                      <div className="flex justify-center">
                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                          className="text-gray-400"
                        >
                          <ArrowRight className="w-6 h-6" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Join Green City?
            </h3>
            <p className="text-gray-600">
              Be part of the solution and enjoy these amazing benefits
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0"
                  >
                    <Icon className={`w-6 h-6 ${benefit.color}`} />
                  </motion.div>
                  <p className="text-sm font-medium text-gray-700">
                    {benefit.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span>Start Your Green Journey</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            viewport={{ once: true }}
            className="text-sm text-gray-500 mt-4"
          >
            No credit card required • Free forever for individual users
          </motion.p>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default HowItWorksSection;