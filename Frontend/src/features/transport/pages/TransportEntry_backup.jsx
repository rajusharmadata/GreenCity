import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axiosInstance from '../../../config/axios';
import { API_ENDPOINTS } from '../../../config/api';

function TransportEntry() {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    defaultValues: {
      departureTimes: [{ time: '' }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'departureTimes'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Extract times from the array
      const departureTimes = data.departureTimes.map(item => item.time).filter(time => time);

      if (departureTimes.length === 0) {
        setError('Please add at least one departure time');
        setLoading(false);
        return;
      }

      if (!data.endingDestination) {
        setError('Ending destination is required');
        setLoading(false);
        return;
      }

      const payload = {
        agencyName: data.agencyName,
        transportType: data.transportType,
        from: data.startingDestination,
        to: data.endingDestination,
        departureTimes: departureTimes,
        frequency: data.frequency ? String(data.frequency) : 'Not specified',
        fare: parseFloat(data.fare) || 0,
        contactInfo: data.contactInfo || 'Not provided'
      };

      const response = await axiosInstance.post(API_ENDPOINTS.TRANSPORT_ENTRY, payload);

      if (response.data && response.data.message) {
        setSuccess('Transport entry submitted successfully!');
        // Reset form
        reset({
          agencyName: '',
          transportType: '',
          startingDestination: '',
          endingDestination: '',
          departureTimes: [{ time: '' }],
          frequency: '',
          fare: '',
          contactInfo: ''
        });
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to submit transport entry. Please try again.';
      setError(errorMessage);
      console.error('Error submitting transport entry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full">
          <h2 className="text-2xl font-bold text-green-700 text-center mb-4">Transport Entry</h2>
          <p className="text-gray-600 text-center mb-6">Provide transport details to add a new entry.</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg">
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Other input fields (unchanged) */}
          <div>
            <label className="block text-gray-700 font-medium">Agency Name*</label>
            <input
              type="text"
              {...register('agencyName', { required: 'Agency name is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter agency name"
            />
            {errors.agencyName && <p className="text-red-500 text-sm">{errors.agencyName.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Transport Type*</label>
            <select
              {...register('transportType', { required: 'Transport type is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Transport Type</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Taxi">Taxi</option>
              <option value="Metro">Metro</option>
            </select>
            {errors.transportType && <p className="text-red-500 text-sm">{errors.transportType.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Starting Destination*</label>
            <input
              type="text"
              {...register('startingDestination', { required: 'Starting destination is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter starting point"
            />
            {errors.startingDestination && <p className="text-red-500 text-sm">{errors.startingDestination.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Ending Destination*</label>
            <input
              type="text"
              {...register('endingDestination', { required: 'Ending destination is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter ending point"
            />
            {errors.endingDestination && <p className="text-red-500 text-sm">{errors.endingDestination.message}</p>}
          </div>

          {/* 👇 Multiple Departure Times (Array) 👇 */}
          <div>
            <label className="block text-gray-700 font-medium">Departure Times*</label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <input
                  type="time"
                  {...register(`departureTimes.${index}.time`, { required: 'Time is required' })}
                  className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 font-bold text-xl">
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => append({ time: '' })}
              className="text-sm text-green-600 mt-1 hover:underline"
            >
              + Add More Time
            </button>
            {errors.departureTimes && <p className="text-red-500 text-sm">Please add at least one time.</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Frequency (per day)*</label>
            <input
              type="number"
              {...register('frequency', { required: 'Frequency is required', min: 1 })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter frequency (e.g. 5)"
            />
            {errors.frequency && <p className="text-red-500 text-sm">{errors.frequency.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Fare (₹)*</label>
            <input
              type="number"
              {...register('fare', { required: 'Fare is required', min: 1 })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter fare amount"
            />
            {errors.fare && <p className="text-red-500 text-sm">{errors.fare.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Contact Info*</label>
            <input
              type="text"
              {...register('contactInfo', { required: 'Contact info is required' })}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter contact details"
            />
            {errors.contactInfo && <p className="text-red-500 text-sm">{errors.contactInfo.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Transport Entry'
            )}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}

export default TransportEntry;
