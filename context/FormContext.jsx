import React, { createContext, useContext, useState } from 'react';
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
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState(1);
  const [toast, setToast] = useState(null);

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
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);
  };

  return (
    <FormContext.Provider
      value={{
        formData,
        setFormData, // IMPORTANT: Expose setFormData for edit functionality
        updateFormData,
        currentStep,
        setCurrentStep, // IMPORTANT: Expose setCurrentStep for edit functionality
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