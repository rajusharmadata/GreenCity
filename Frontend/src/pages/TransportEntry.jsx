import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/authcontext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Bus,
  Train,
  Zap,
  Car,
  Bike,
  Navigation,
  Info,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';

const transportTypes = [
  { 
    id: 'bus', 
    name: 'Bus', 
    icon: Bus, 
    color: 'blue',
    description: 'Public bus transportation',
    ecoScore: 8
  },
  { 
    id: 'train', 
    name: 'Train', 
    icon: Train, 
    color: 'green',
    description: 'Rail transportation',
    ecoScore: 9
  },
  { 
    id: 'metro', 
    name: 'Metro', 
    icon: Navigation, 
    color: 'purple',
    description: 'Subway/metro system',
    ecoScore: 9
  },
  { 
    id: 'shared_cab', 
    name: 'Shared Cab', 
    icon: Car, 
    color: 'orange',
    description: 'Ride-sharing services',
    ecoScore: 6
  },
  { 
    id: 'bike', 
    name: 'Bicycle', 
    icon: Bike, 
    color: 'emerald',
    description: 'Bicycle sharing',
    ecoScore: 10
  },
  { 
    id: 'other', 
    name: 'Other', 
    icon: Zap, 
    color: 'gray',
    description: 'Other eco-friendly transport',
    ecoScore: 7
  }
];

const frequencyOptions = [
  { id: 'daily', name: 'Daily', description: 'Every day' },
  { id: 'weekly', name: 'Weekly', description: 'Once a week' },
  { id: 'weekdays', name: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekends', name: 'Weekends', description: 'Saturday and Sunday' },
  { id: 'custom', name: 'Custom', description: 'Custom schedule' }
];

function TransportEntry() {
  const { user } = useAuth();
  const { success, error: showError } = useNotification();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm();
  const [loading, setLoading] = useState(false);
  const [departureTimes, setDepartureTimes] = useState(['']);
  const [selectedTransport, setSelectedTransport] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');
  const [calculatedEcoPoints, setCalculatedEcoPoints] = useState(0);

  const watchedTransport = watch('transportType');
  const watchedFrequency = watch('frequency');

  React.useEffect(() => {
    if (watchedTransport) {
      setSelectedTransport(watchedTransport);
      calculateEcoPoints(watchedTransport, watchedFrequency);
    }
    if (watchedFrequency) {
      setSelectedFrequency(watchedFrequency);
      calculateEcoPoints(watchedTransport, watchedFrequency);
    }
  }, [watchedTransport, watchedFrequency]);

  const calculateEcoPoints = (transportType, frequency) => {
    const transport = transportTypes.find(t => t.id === transportType);
    if (!transport) return;

    let basePoints = transport.ecoScore * 10;
    
    // Frequency multiplier
    const frequencyMultipliers = {
      daily: 1.5,
      weekly: 1.2,
      weekdays: 1.3,
      weekends: 1.1,
      custom: 1.0
    };
    
    const multiplier = frequencyMultipliers[frequency] || 1.0;
    const points = Math.round(basePoints * multiplier);
    setCalculatedEcoPoints(points);
  };

  const addDepartureTime = () => {
    setDepartureTimes([...departureTimes, '']);
  };

  const removeDepartureTime = (index) => {
    const newTimes = departureTimes.filter((_, i) => i !== index);
    setDepartureTimes(newTimes);
  };

  const updateDepartureTime = (index, value) => {
    const newTimes = [...departureTimes];
    newTimes[index] = value;
    setDepartureTimes(newTimes);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Filter out empty departure times
      const validDepartureTimes = departureTimes.filter(time => time.trim() !== '');
      
      if (validDepartureTimes.length === 0) {
        showError('Please add at least one departure time');
        setLoading(false);
        return;
      }

      const payload = {
        agencyName: data.agencyName,
        transportType: selectedTransport,
        from: data.from,
        to: data.to,
        departureTimes: validDepartureTimes,
        frequency: selectedFrequency,
        fare: parseFloat(data.fare),
        contactInfo: data.contactInfo || 'Not provided',
        userId: user._id
      };

      const response = await axiosInstance.post(API_ENDPOINTS.TRANSPORT_ENTRY, payload);
      
      if (response.data) {
        success(`Transport entry added successfully! You earned ${calculatedEcoPoints} eco points.`);
        reset();
        setDepartureTimes(['']);
        setSelectedTransport('');
        setSelectedFrequency('daily');
        setCalculatedEcoPoints(0);
        
        setTimeout(() => {
          navigate('/user-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating transport entry:', err);
      showError(err.response?.data?.message || 'Failed to add transport entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTransportIcon = (transportId) => {
    const transport = transportTypes.find(t => t.id === transportId);
    return transport ? transport.icon : Bus;
  };

  const getTransportColor = (transportId) => {
    const transport = transportTypes.find(t => t.id === transportId);
    return transport ? transport.color : 'gray';
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
              <Navigation className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Add Eco Transport
              </h1>
              <Navigation className="w-8 h-8 text-green-600 ml-3" />
            </div>
            <p className="text-gray-600 text-lg">Share sustainable transportation options with your community</p>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-green-500" />
                <span>Earn {calculatedEcoPoints} points</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                <span>Eco-friendly contribution</span>
              </div>
            </div>
          </motion.div>

          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Transport Type Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Navigation className="w-6 h-6 mr-2 text-blue-600" />
                  Transport Type
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transportTypes.map((transport) => {
                    const Icon = transport.icon;
                    return (
                      <motion.div
                        key={transport.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setValue('transportType', transport.id)}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                          selectedTransport === transport.id
                            ? `border-${transport.color}-500 bg-${transport.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <Icon className={`w-6 h-6 mr-2 text-${transport.color}-600`} />
                          <span className="font-semibold">{transport.name}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{transport.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            <span className="text-xs font-medium">Eco Score: {transport.ecoScore}/10</span>
                          </div>
                          {selectedTransport === transport.id && (
                            <div className={`w-6 h-6 bg-${transport.color}-600 rounded-full flex items-center justify-center`}>
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                {errors.transportType && (
                  <p className="mt-2 text-sm text-red-600">{errors.transportType.message}</p>
                )}
              </div>

              {/* Route Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <MapPin className="w-6 h-6 mr-2 text-red-600" />
                  Route Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Agency Name *
                    </label>
                    <input
                      type="text"
                      {...register('agencyName', { required: 'Agency name is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., City Transport Authority"
                    />
                    {errors.agencyName && (
                      <p className="mt-2 text-sm text-red-600">{errors.agencyName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fare ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('fare', { 
                        required: 'Fare is required',
                        min: { value: 0, message: 'Fare must be positive' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    {errors.fare && (
                      <p className="mt-2 text-sm text-red-600">{errors.fare.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From (Starting Point) *
                    </label>
                    <input
                      type="text"
                      {...register('from', { required: 'Starting point is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Central Station"
                    />
                    {errors.from && (
                      <p className="mt-2 text-sm text-red-600">{errors.from.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To (Destination) *
                    </label>
                    <input
                      type="text"
                      {...register('to', { required: 'Destination is required' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., Airport Terminal"
                    />
                    {errors.to && (
                      <p className="mt-2 text-sm text-red-600">{errors.to.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-purple-600" />
                  Schedule
                </h2>

                {/* Frequency */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Frequency *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {frequencyOptions.map((freq) => (
                      <motion.div
                        key={freq.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setValue('frequency', freq.id)}
                        className={`relative cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                          selectedFrequency === freq.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{freq.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{freq.description}</div>
                        {selectedFrequency === freq.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Departure Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Departure Times *
                  </label>
                  <div className="space-y-3">
                    {departureTimes.map((time, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => updateDepartureTime(index, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {departureTimes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDepartureTime(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={addDepartureTime}
                    className="mt-3 flex items-center text-green-600 hover:text-green-700 font-medium"
                  >
                    <Plus className="w-5 h-5 mr-1" />
                    Add Another Time
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Phone className="w-6 h-6 mr-2 text-blue-600" />
                  Contact Information
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Details (Optional)
                  </label>
                  <input
                    type="text"
                    {...register('contactInfo')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Phone number, email, or website"
                  />
                </div>
              </div>

              {/* Eco Points Preview */}
              {calculatedEcoPoints > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-green-800">Eco Points Earned</h3>
                        <p className="text-sm text-green-600">Based on transport type and frequency</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      +{calculatedEcoPoints}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Add Transport Entry
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Info Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-3">
                <Globe className="w-8 h-8 text-blue-600 mr-3" />
                <h3 className="font-semibold">Community Impact</h3>
              </div>
              <p className="text-sm text-gray-600">
                Your contribution helps others find sustainable transportation options and reduces carbon footprint.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-3">
                <Award className="w-8 h-8 text-yellow-600 mr-3" />
                <h3 className="font-semibold">Earn Rewards</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get eco points for each transport entry and climb the leaderboard while helping your community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center mb-3">
                <Info className="w-8 h-8 text-purple-600 mr-3" />
                <h3 className="font-semibold">Verified Information</h3>
              </div>
              <p className="text-sm text-gray-600">
                All transport entries are reviewed to ensure accuracy and reliability for community members.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransportEntry;
