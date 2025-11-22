import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const FormContext = createContext();

const FormProvider = ({ children, onSubmit, validationSchema, defaultValues = {} }) => {
  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const setError = (name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const setTouchedField = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name, value) => {
    if (!validationSchema || !validationSchema[name]) {
      setError(name, '');
      return true;
    }

    const rules = validationSchema[name];
    let error = '';

    if (rules.required && (!value || value.toString().trim() === '')) {
      error = rules.requiredMessage || `${name} is required`;
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `Must be at least ${rules.minLength} characters`;
    } else if (rules.maxLength && value.length > rules.maxLength) {
      error = `Must be no more than ${rules.maxLength} characters`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      error = rules.patternMessage || 'Invalid format';
    } else if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Please enter a valid email address';
    } else if (rules.match && value !== values[rules.match]) {
      error = `Must match ${rules.match}`;
    }

    setError(name, error);
    return !error;
  };

  const validateAll = () => {
    let isValid = true;
    Object.keys(validationSchema || {}).forEach(field => {
      const fieldValid = validateField(field, values[field]);
      if (!fieldValid) isValid = false;
    });
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allFields = Object.keys(validationSchema || {});
    setTouched(allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {}));

    const isValid = validateAll();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(defaultValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return (
    <FormContext.Provider value={{
      values,
      errors,
      touched,
      isSubmitting,
      setValue,
      setError,
      setTouchedField,
      handleSubmit,
      resetForm
    }}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {children}
      </form>
    </FormContext.Provider>
  );
};

const FormField = ({ name, label, children, required, helperText }) => {
  const { values, errors, touched, setTouchedField } = useContext(FormContext);
  const hasError = touched[name] && errors[name];

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {React.cloneElement(children, {
          value: values[name] || '',
          onChange: (e) => {
            const child = children;
            if (typeof child.props.onChange === 'function') {
              child.props.onChange(e);
            }
          },
          onBlur: () => setTouchedField(name),
          error: hasError ? errors[name] : '',
          className: cn(
            children.props.className,
            hasError && 'border-red-500 focus:ring-red-500'
          )
        })}
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-2 right-2"
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
          </motion.div>
        )}
      </div>
      {(hasError || helperText) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn(
            "text-xs flex items-center",
            hasError ? "text-red-500" : "text-gray-500"
          )}
        >
          {hasError && <AlertCircle className="w-3 h-3 mr-1" />}
          {hasError ? errors[name] : helperText}
        </motion.div>
      )}
    </div>
  );
};

const FormActions = ({ children, align = 'right' }) => {
  const { isSubmitting } = useContext(FormContext);
  
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex items-center space-x-3 ${alignClasses[align]}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          disabled: isSubmitting || child.props.disabled,
          loading: isSubmitting && child.props.type === 'submit'
        })
      )}
    </div>
  );
};

const FormSuccess = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg"
    >
      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
      <span className="text-green-800 text-sm">{message}</span>
    </motion.div>
  );
};

const FormError = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
    >
      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
      <span className="text-red-800 text-sm">{message}</span>
    </motion.div>
  );
};

export { FormProvider, FormField, FormActions, FormSuccess, FormError };
export const useForm = () => useContext(FormContext);
