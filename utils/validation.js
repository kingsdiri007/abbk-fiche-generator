export function validateStep1(formData) {
  const errors = [];

  // Removed audienceType validation since we no longer have that choice

  if (!formData.selectedClientId) {
    errors.push('Please select a client from the dropdown');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStep2(formData) {
  const errors = [];

  if (!formData.interventionType) {
    errors.push('Please select intervention type (Formation or License)');
  }

  // License mode validation
  if (formData.interventionType === 'license') {
    const validLicenses = formData.licenses.filter(lic => lic.name && lic.quantity);
    
    if (validLicenses.length === 0) {
      errors.push('Please add at least one license with name and quantity');
    }

    // Check for licenses with missing data
    formData.licenses.forEach((lic, idx) => {
      if (lic.name && !lic.quantity) {
        errors.push(`License ${idx + 1}: Please enter quantity`);
      }
      if (lic.quantity && !lic.name) {
        errors.push(`License ${idx + 1}: Please select license name`);
      }
    });
  }

  // Formation mode validation - FIXED to use selectedFormations
  if (formData.interventionType === 'formation') {
    if (!formData.selectedFormations || formData.selectedFormations.length === 0) {
      errors.push('Please select at least one formation');
    }

    // Validate each selected formation
    (formData.selectedFormations || []).forEach(formationId => {
      const formationData = formData.formationsData[formationId];
      
      if (!formationData) {
        errors.push(`Formation ${formationId}: Missing data`);
        return;
      }
      
      if (!formationData.formationName) {
        errors.push(`Formation ${formationData.formationName || formationId}: Please enter formation name`);
      }
      
      if (!formationData.formationRef) {
        errors.push(`Formation ${formationData.formationName || formationId}: Please enter formation reference`);
      }

      // Check schedule
      const validSchedule = (formationData.schedule || []).filter(day => 
        day.content || day.methods || day.theoryHours || day.practiceHours
      );

      if (validSchedule.length === 0) {
        errors.push(`Formation ${formationData.formationName || formationId}: Please fill in at least one schedule day`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStep3(formData) {
  const errors = [];

  if (!formData.referenceBC) {
    errors.push('Please enter Reference BC');
  }

  if (!formData.interventionDate) {
    errors.push('Please select intervention date');
  }

  if (!formData.intervenant) {
    errors.push('Please select an intervenant');
  }

  if (!formData.location) {
    errors.push('Please enter location (Fait à)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAllSteps(formData) {
  const step1 = validateStep1(formData);
  const step2 = validateStep2(formData);
  const step3 = validateStep3(formData);

  const allErrors = [...step1.errors, ...step2.errors, ...step3.errors];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    step1Valid: step1.isValid,
    step2Valid: step2.isValid,
    step3Valid: step3.isValid
  };
}