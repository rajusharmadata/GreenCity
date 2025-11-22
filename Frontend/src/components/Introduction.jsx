import React from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Globe, 
  Heart, 
  Users, 
  Zap,
  ArrowRight,
  Sparkles,
  TreePine
} from 'lucide-react';

function IntroSection() {
  const features = [
    { icon: Leaf, label: 'Eco-Friendly', color: 'text-green-600' },
    { icon: Globe, label: 'Global Impact', color: 'text-blue-600' },
    { icon: Users, label: 'Community Driven', color: 'text-purple-600' },
    { icon: Zap, label: 'Smart Solutions', color: 'text-yellow-600' }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative py-20 px-4 bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 overflow-hidden"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-10 w-32 h-32 bg-emerald-100 rounded-full opacity-30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-100 rounded-full opacity-30"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Sustainable Living Platform</span>
          </motion.div>

          {/* Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-5xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to Green City
            </span>
            <div className="flex justify-center mt-4">
              <TreePine className="w-8 h-8 text-emerald-500" />
            </div>
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8"
          >
            Transform your urban lifestyle with our innovative platform connecting you to 
            <span className="font-semibold text-emerald-600"> eco-friendly initiatives</span>, 
            <span className="font-semibold text-cyan-600"> sustainable transport</span>, and 
            <span className="font-semibold text-blue-600"> green community projects</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-emerald-600 border-2 border-emerald-200 rounded-xl font-medium hover:bg-emerald-50 transition-all duration-200 flex items-center space-x-2"
            >
              <Heart className="w-4 h-4" />
              <span>Learn More</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-md`}
                  >
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </motion.div>
                  <div>
                    <h3 className={`font-semibold text-lg ${feature.color}`}>
                      {feature.label}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Experience sustainable living
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}

export default IntroSection;