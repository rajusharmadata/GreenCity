import { useState, useCallback } from 'react';
import { ValidationResult, validateForm } from '../utils/validators';

interface UseFormValidationProps<T extends Record<string, any>> {
  initialValues: T;
  validationRules: Record<keyof T, (value: any) => ValidationResult>;
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormValidationReturn<T extends Record<string, any>> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: () => void;
  resetForm: () => void;
  isValid: boolean;
  isSubmitting: boolean;
}

export const useFormValidation = <T extends Record<string, any>>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormValidationProps<T>): UseFormValidationReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Validate field if it has been touched
    if (touched[field]) {
      const result = validationRules[field](value);
      setErrors(prev => ({
        ...prev,
        [field]: result.valid ? '' : (result.message || '')
      }));
    }
  }, [validationRules, touched]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const result = validationRules[field](values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: result.valid ? '' : (result.message || '')
    }));
  }, [validationRules, values]);

  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    setTouched(
      Object.keys(initialValues).reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<keyof T, boolean>)
    );

    // Validate all fields
    const validationErrors = validateForm(values, validationRules);
    setErrors(validationErrors as Record<keyof T, string>);

    const hasErrors = Object.keys(validationErrors).length > 0;
    
    if (!hasErrors) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validationRules, onSubmit, initialValues]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).every(key => !errors[key as keyof T]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    isValid,
    isSubmitting,
  };
};
