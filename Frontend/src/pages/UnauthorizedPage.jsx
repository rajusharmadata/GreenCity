import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa';

const UnauthorizedPage = () => {
  const location = useLocation();
  const message = location.state?.message || 'Access denied. You do not have permission to view this page.';
  const from = location.state?.from || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <FaExclamationTriangle className="text-red-600 text-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8">
            {message}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            What can you do?
          </h3>
          <ul className="space-y-3 text-sm text-gray-600 mb-6">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Login with the correct account type
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Contact an administrator for access
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Return to the homepage
            </li>
          </ul>

          <div className="space-y-3">
            <Link
              to="/login/user"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Login with Different Account
            </Link>
            
            <div className="flex space-x-3">
              <Link
                to={from}
                className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </Link>
              
              <Link
                to="/"
                className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaHome className="mr-2" />
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
