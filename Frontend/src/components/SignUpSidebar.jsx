import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, ShieldCheck, LogIn } from 'lucide-react';

function SignUpSidebar() {
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 bg-gradient-to-br from-white via-green-50 to-white rounded-2xl shadow-2xl w-full max-w-sm border border-green-100 ml-10"
    >
      <h2 className="text-3xl font-extrabold text-green-800 mb-6 text-center tracking-tight">
        🌿 Join <span className="text-green-900">Green City</span>
      </h2>

      {/* Admin Signup */}
      <button
        onClick={() => navigate('/register/admin')}
        className="flex items-center justify-center gap-3 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 mb-3 rounded-xl shadow hover:shadow-md transition-all duration-300"
      >
        <ShieldCheck size={20} />
        Sign Up as Admin
      </button>

      {/* User Signup */}
      <button
        onClick={() => navigate('/register/user')}
        className="flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 mb-3 rounded-xl shadow hover:shadow-md transition-all duration-300"
      >
        <UserPlus size={20} />
        Sign Up as User
      </button>

      {/* Divider */}
      <div className="border-t pt-5 mt-6">
        <p className="text-gray-500 text-sm text-center mb-4">
          Already have an account?
        </p>

        {/* Admin Login */}
        <button
          onClick={() => navigate('/login/admin')}
          className="flex items-center justify-center gap-3 w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2.5 mb-3 rounded-xl shadow hover:shadow-md transition-all duration-300"
        >
          <LogIn size={20} />
          Admin Login
        </button>

        {/* Organization Login */}
        <button
          onClick={() => navigate('/login/org')}
          className="flex items-center justify-center gap-3 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 mb-3 rounded-xl shadow hover:shadow-md transition-all duration-300"
        >
          <LogIn size={20} />
          Organization Login
        </button>

        {/* User Login */}
        <button
          onClick={() => navigate('/login/user')}
          className="flex items-center justify-center gap-3 w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-xl shadow hover:shadow-md transition-all duration-300"
        >
          <LogIn size={20} />
          User Login
        </button>
      </div>
    </motion.aside>
  );
}

export default SignUpSidebar;
