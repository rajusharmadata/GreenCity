import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../config/axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
import { API_ENDPOINTS } from '../config/api';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Crosshair,
  Loader2,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle,
  FileText,
  Map,
  Clock,
  User,
  Mail,
  Phone,
  X,
  Info,
  Zap,
  Shield,
  TreePine,
  Droplets,
  Wind,
  Sun,
  Trash2,
  ArrowRight
} from 'lucide-react';

const issueCategories = [
  { id: 'pollution', name: 'Air/Water Pollution', icon: Wind, color: 'blue', description: 'Air quality issues, water contamination' },
  { id: 'waste', name: 'Waste Management', icon: Trash2, color: 'orange', description: 'Illegal dumping, garbage accumulation' },
  { id: 'deforestation', name: 'Deforestation', icon: TreePine, color: 'green', description: 'Illegal tree cutting, forest damage' },
  { id: 'water', name: 'Water Issues', icon: Droplets, color: 'cyan', description: 'Water pollution, drainage problems' },
  { id: 'noise', name: 'Noise Pollution', icon: Sun, color: 'yellow', description: 'Excessive noise, sound pollution' },
  { id: 'other', name: 'Other', icon: AlertTriangle, color: 'red', description: 'Other environmental concerns' }
];

const priorityLevels = [
  { id: 'low', name: 'Low', description: 'Minor issue, no immediate danger', color: 'green' },
  { id: 'medium', name: 'Medium', description: 'Requires attention', color: 'orange' },
  { id: 'high', name: 'High', description: 'Urgent, immediate action needed', color: 'red' }
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
            {
              headers: {
                'User-Agent': 'GreenCityApp/1.0'
              }
            }
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch address');
          }
          
          const data = await response.json();
          const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setCurrentLocation(address);
          setValue('location', address);
          setLocationLoading(false);
        } catch (err) {
          setValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
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
      
      const finalData = {
        ...formData,
        ...data,
        username: user.username
      };

      const formDataToSend = new FormData();
      
      // Add only the fields backend expects
      formDataToSend.append('username', finalData.username);
      formDataToSend.append('title', finalData.title);
      formDataToSend.append('description', finalData.description);
      formDataToSend.append('location', finalData.location);
      
      // Add image file if exists
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      const response = await axiosInstance.post(API_ENDPOINTS.REPORT_ISSUE, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        success('Issue reported successfully! You earned 50 eco points.');
        reset();
        setImage(null);
        setImageFile(null);
        setCurrentLocation('');
        setStep(1);
        setFormData({});
        setTimeout(() => {
          navigate('/user-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error reporting issue:', err);
      showError(err.response?.data?.message || 'Failed to report issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = issueCategories.find(cat => cat.id === categoryId);
    return category ? category.icon : AlertTriangle;
  };

  const getCategoryColor = (categoryId) => {
    const category = issueCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'gray';
  };

  const getPriorityColor = (priority) => {
    const level = priorityLevels.find(p => p.id === priority);
    return level ? level.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Report Environmental Issue
              </h1>
            </div>
            <p className="text-gray-600 text-lg">Help us make your community cleaner and safer</p>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-center mt-6 space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="ml-2">Issue Details</span>
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="ml-2">Location & Photo</span>
              </div>
            </div>
          </motion.div>

          {/* Step 1: Issue Details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <form onSubmit={handleSubmit(onSubmitStep1)}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-blue-600" />
                    Issue Details
                  </h2>
                  
                  {/* Category Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Issue Category *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {issueCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                          <motion.div
                            key={category.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setValue('category', category.id)}
                            className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                              selectedCategory === category.id
                                ? `border-${category.color}-500 bg-${category.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center mb-2">
                              <Icon className={`w-6 h-6 mr-2 text-${category.color}-600`} />
                              <span className="font-semibold">{category.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">{category.description}</p>
                            {selectedCategory === category.id && (
                              <div className={`absolute top-2 right-2 w-6 h-6 bg-${category.color}-600 rounded-full flex items-center justify-center`}>
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Title *
                    </label>
                    <input
                      type="text"
                      {...register('title', { required: 'Title is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Brief description of the issue"
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: { value: 20, message: 'Description must be at least 20 characters' }
                      })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Provide detailed information about the environmental issue..."
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  {/* Priority Level */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Priority Level *
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {priorityLevels.map((priority) => (
                        <motion.div
                          key={priority.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setValue('priority', priority.id)}
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                            selectedPriority === priority.id
                              ? `border-${priority.color}-500 bg-${priority.color}-50`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`text-lg font-bold text-${priority.color}-600`}>
                              {priority.name}
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{priority.description}</p>
                          </div>
                          {selectedPriority === priority.id && (
                            <div className={`absolute top-2 right-2 w-6 h-6 bg-${priority.color}-600 rounded-full flex items-center justify-center`}>
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        defaultValue={user?.email}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 2: Location & Photo */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-red-600" />
                    Location & Evidence
                  </h2>

                  {/* Location */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Location *
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        {...register('location', { required: 'Location is required' })}
                        value={currentLocation}
                        onChange={(e) => {
                          setCurrentLocation(e.target.value);
                          setValue('location', e.target.value);
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter location or use GPS"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        {locationLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Crosshair className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {errors.location && (
                      <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>
                    )}
                  </div>

                  {/* Image Upload */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Photo Evidence (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {image ? (
                        <div className="relative">
                          <img
                            src={image}
                            alt="Issue preview"
                            className="max-w-full h-64 mx-auto rounded-lg object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Click to upload photo</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                          >
                            Choose Photo
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      Issue Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Category:</strong> {selectedCategory}</p>
                      <p><strong>Priority:</strong> {selectedPriority}</p>
                      <p><strong>Title:</strong> {formData.title}</p>
                      <p><strong>Location:</strong> {currentLocation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Submit Issue
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-3">
                <Shield className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="font-semibold">Your Privacy</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your personal information is kept confidential and only shared with relevant authorities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-3">
                <Zap className="w-8 h-8 text-yellow-600 mr-3" />
                <h3 className="font-semibold">Earn Points</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get 50 eco points for each verified issue report. Help your community and climb the leaderboard!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-3">
                <Clock className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="font-semibold">Quick Response</h3>
              </div>
              <p className="text-sm text-gray-600">
                Issues are typically reviewed within 24-48 hours and assigned to appropriate authorities.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportIssue;
