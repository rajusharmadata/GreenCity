import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Navigation, Bus, Train, Car, ArrowRight, Clock, Phone, X, Filter, Sparkles, Loader2 } from "lucide-react";
import axiosInstance from "../config/axios";
import { API_ENDPOINTS } from "../config/api";

const transportIcons = {
  Bus: Bus,
  Train: Train,
  Metro: Train,
  SharedCab: Car,
  Other: Car,
};

const transportColors = {
  Bus: "from-blue-500 to-blue-600",
  Train: "from-purple-500 to-purple-600",
  Metro: "from-indigo-500 to-indigo-600",
  SharedCab: "from-green-500 to-green-600",
  Other: "from-gray-500 to-gray-600",
};

function EcoTransport() {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [transportType, setTransportType] = useState("");
  const [transportOptions, setTransportOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allTransports, setAllTransports] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAllTransports();
  }, []);

  const fetchAllTransports = async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.GET_ALL_TRANSPORTS);
      if (response.data) {
        setAllTransports(response.data);
      }
    } catch (err) {
      console.error("Error fetching transports:", err);
    }
  };

  const findTransport = async () => {
    if (!start.trim() || !destination.trim()) {
      setError("Please enter both starting point and destination.");
      return;
    }

    setLoading(true);
    setError("");
    setTransportOptions([]);

    try {
      const response = await axiosInstance.post(API_ENDPOINTS.TRANSPORT_QUERY, {
        from: start.trim(),
        to: destination.trim(),
        transportType: transportType || undefined
      });

      if (response.data && response.data.data) {
        let results = response.data.data;
        setTransportOptions(results);
        
        if (results.length === 0) {
          setError("No transport options found for this route. Try different locations or browse all available routes below.");
        } else {
          setError("");
        }
      } else {
        setError("No transport options found for this route. Check all available routes below.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No exact matches found. Check all available routes below or try different search terms.");
      } else {
        const errorMessage = err.response?.data?.message || "Failed to find transport options. Please try again.";
        setError(errorMessage);
      }
      console.error("Error fetching transport:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setStart("");
    setDestination("");
    setTransportType("");
    setTransportOptions([]);
    setError("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      findTransport();
    }
  };

  const handleRouteClick = (transport) => {
    setStart(transport.from);
    setDestination(transport.to);
    setTransportType("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayTransports = transportOptions.length > 0 ? transportOptions : (allTransports.slice(0, 12));
  const showAllRoutes = transportOptions.length === 0 && !loading && !start && !destination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/30">
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
              <span className="text-sm font-medium text-white">Eco-Friendly Transportation</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Find Your Perfect
              <span className="block text-emerald-200">Eco Transport</span>
            </h1>
            <p className="text-lg sm:text-xl text-emerald-50 max-w-2xl mx-auto">
              Discover sustainable transportation options for your journey. Search, compare, and choose the best eco-friendly route.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200/50 p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Search className="h-6 w-6 text-emerald-600" />
              Search Routes
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
            >
              <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* From Input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1 text-emerald-600" />
                From
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                  placeholder="Enter starting point"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* To Input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Navigation className="h-4 w-4 inline mr-1 text-emerald-600" />
                To
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 text-slate-900 placeholder-slate-400"
                  placeholder="Enter destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Transport Type Filter */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Filter className="h-4 w-4 inline mr-1 text-emerald-600" />
                Transport Type
              </label>
              <select
                className="w-full pl-4 pr-10 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50 text-slate-900 appearance-none cursor-pointer"
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Bus">🚌 Bus</option>
                <option value="Train">🚂 Train</option>
                <option value="Metro">🚇 Metro</option>
                <option value="SharedCab">🚗 Shared Cab</option>
                <option value="Other">🚕 Other</option>
              </select>
              <ArrowRight className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={findTransport}
              disabled={loading || !start.trim() || !destination.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-emerald-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Search Routes</span>
                </>
              )}
            </button>
            
            {(start || destination || transportType || transportOptions.length > 0) && (
              <button
                onClick={handleClearSearch}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                <X className="h-5 w-5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Searching for routes...</p>
            </motion.div>
          ) : transportOptions.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Found {transportOptions.length} Route{transportOptions.length > 1 ? 's' : ''}
                </h2>
                <p className="text-slate-600">
                  From <span className="font-semibold text-emerald-600">{start}</span> to <span className="font-semibold text-emerald-600">{destination}</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {transportOptions.map((transport, index) => {
                  const Icon = transportIcons[transport.transportType] || Car;
                  const colorClass = transportColors[transport.transportType] || "from-gray-500 to-gray-600";
                  return (
                    <motion.div
                      key={transport._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${colorClass} p-6 text-white`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white/90">Transport Type</p>
                              <p className="text-lg font-bold">{transport.transportType}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white/80">Fare</p>
                            <p className="text-2xl font-bold">₹{transport.fare}</p>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold">{transport.agencyName}</h3>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        {/* Route Info */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                            <MapPin className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">From</p>
                              <p className="font-semibold text-slate-900 truncate">{transport.from}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <Navigation className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 mb-1">To</p>
                              <p className="font-semibold text-slate-900 truncate">{transport.to}</p>
                            </div>
                          </div>
                        </div>

                        {/* Frequency */}
                        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                          <Clock className="h-5 w-5 text-slate-600" />
                          <div className="flex-1">
                            <p className="text-xs text-slate-500">Frequency</p>
                            <p className="font-semibold text-slate-900">{transport.frequency}</p>
                          </div>
                        </div>

                        {/* Departure Times */}
                        {Array.isArray(transport.departureTimes) && transport.departureTimes.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-slate-700 mb-2">Departure Times</p>
                            <div className="flex flex-wrap gap-2">
                              {transport.departureTimes.slice(0, 4).map((time, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium">
                                  {time}
                                </span>
                              ))}
                              {transport.departureTimes.length > 4 && (
                                <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                                  +{transport.departureTimes.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Contact Info */}
                        {transport.contactInfo && transport.contactInfo !== 'Not provided' && (
                          <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-600">Contact:</span>
                              <span className="font-semibold text-emerald-600">{transport.contactInfo}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : showAllRoutes ? (
            <motion.div
              key="popular"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Popular Routes</h2>
                <p className="text-slate-600">Click on any route to search for it</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allTransports.slice(0, 9).map((transport, index) => {
                  const Icon = transportIcons[transport.transportType] || Car;
                  const colorClass = transportColors[transport.transportType] || "from-gray-500 to-gray-600";
                  return (
                    <motion.div
                      key={transport._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleRouteClick(transport)}
                      className="group bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-400 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      <div className={`bg-gradient-to-r ${colorClass} p-5 text-white`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-xl font-bold">₹{transport.fare}</span>
                        </div>
                        <h3 className="text-lg font-bold truncate">{transport.agencyName}</h3>
                        <p className="text-sm text-white/80 mt-1">{transport.transportType}</p>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-emerald-600" />
                          <p className="text-sm font-semibold text-slate-900 truncate">{transport.from}</p>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <Navigation className="h-4 w-4 text-blue-600" />
                          <p className="text-sm font-semibold text-slate-900 truncate">{transport.to}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{transport.frequency}</span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                            Click to search →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EcoTransport;
