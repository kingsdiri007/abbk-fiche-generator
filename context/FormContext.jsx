import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_FORM_DATA } from '../utils/constants';

const FormContext = createContext();

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  return context;
};

export const FormProvider = ({ children }) => {
  // Load saved step and data from localStorage on mount
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('formData');
    return savedData ? JSON.parse(savedData) : INITIAL_FORM_DATA;
  });
  
  const [currentStep, setCurrentStepState] = useState(() => {
    const savedStep = localStorage.getItem('currentStep');
    return savedStep ? parseInt(savedStep) : 1;
  });
  
  const [toast, setToast] = useState(null);

  // Save formData to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  // Save currentStep to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('currentStep', currentStep.toString());
  }, [currentStep]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const addLicense = () => {
    setFormData((prev) => ({
      ...prev,
      licenses: [...prev.licenses, { name: '', quantity: '', serial: '', invoice: '' }]
    }));
  };

  const updateLicense = (index, field, value) => {
    setFormData((prev) => {
      const newLicenses = [...prev.licenses];
      newLicenses[index][field] = value;
      return { ...prev, licenses: newLicenses };
    });
  };

  const removeLicense = (index) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index)
    }));
  };

  const goNext = () => {
    if (currentStep < 7) setCurrentStepState(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStepState(currentStep - 1);
  };

  const setCurrentStep = (step) => {
    setCurrentStepState(step);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStepState(1);
    localStorage.removeItem('formData');
    localStorage.removeItem('currentStep');
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        setFormData,
        updateFormData,
        currentStep,
        setCurrentStep,
        goNext,
        goBack,
        addLicense,
        updateLicense,
        removeLicense,
        resetForm,
        toast,
        showToast,
        hideToast
      }}
    >
      {children}
    </FormContext.Provider>
  );
};