import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { downloadPDF, getPDFBlob } from '../utils/PdfGenerator';
import { uploadPDFToPack, createFormationPack } from '../services/supabaseService';
import { validateStep1, validateStep2, validateStep3, validateAllSteps } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import ErrorList from './ErrorList';
import FormationPackModal from './FormationPackModal';

export default function NavigationButtons({ totalSteps = 4 }) {
  const { currentStep, goNext, goBack, formData, showToast, resetForm, setCurrentStep, updateFormData } = useFormContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPackModal, setShowPackModal] = useState(false);
  const [currentPackId, setCurrentPackId] = useState(null);
  const navigate = useNavigate();

  const validateCurrentStep = () => {
    let validation;
    
    switch (currentStep) {
      case 1:
        validation = validateStep1(formData);
        break;
      case 2:
        validation = validateStep2(formData);
        break;
      case 3:
        validation = validateStep3(formData);
        break;
      case 4:
        validation = validateAllSteps(formData);
        break;
      case 5:
        // Validate Step 5 (Fiche Plan)
        const planErrors = [];
        if (!formData.planData?.formations?.[0]?.formationName) {
          planErrors.push('Please fill in at least one formation name');
        }
        validation = { isValid: planErrors.length === 0, errors: planErrors };
        break;
      default:
        validation = { isValid: true, errors: [] };
    }

    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setErrors([]);
      goNext();
      showToast?.('Step completed successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast?.('Please fix the errors before continuing', 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
const handleGeneratePDF = async () => {
  const validation = validateAllSteps(formData);
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    showToast?.('Please complete all required fields', 'error');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  setIsGenerating(true);
  setErrors([]);
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    const fileName = downloadPDF(formData);
    
    const pdfBlob = getPDFBlob(formData);
    const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    const ficheType = formData.interventionType;
    
    if (ficheType === 'formation') {
      console.log('🔵 Starting formation pack creation...');
      
      const packData = {
        pack_name: `Formation ${formData.clientName} - ${new Date().toLocaleDateString()}`,
        client_id: formData.selectedClientId,
        formation_ids: formData.selectedFormations || [],
        form_data: formData
      };
      
      console.log('🔵 Pack data:', packData);
      
      const pack = await createFormationPack(packData);
      console.log('✅ Pack created:', pack);
      
      setCurrentPackId(pack.id);
      
      // Fix: Complete the uploadPDFToPack call with all required parameters
      await uploadPDFToPack(
        pdfFile,
        'formation',
        'programme',
        formData.selectedClientId,
        formData,
        pack.id
      );
      console.log('✅ PDF uploaded');
      
      showToast?.(`PDF generated successfully! File: ${fileName}`, 'success');
      console.log('🔵 About to show modal...');
      
      setShowPackModal(true);
      console.log('🔵 Modal state set to true');
    } else {
      const { uploadPDF } = await import('../services/supabaseService');
      await uploadPDF(pdfFile, 'license', formData.selectedClientId, formData);
      
      showToast?.(`PDF generated and saved! File: ${fileName}`, 'success');
      
      setTimeout(() => {
        resetForm?.();
        navigate('/');
      }, 2000);
    }
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    showToast?.('Error generating PDF: ' + error.message, 'error');
  } finally {
    setIsGenerating(false);
  }
};
  // Generate Fiche Plan PDF
  const handleGeneratePlanPDF = async () => {
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Import the plan PDF generator (we'll create this next)
      const { generatePlanPDF } = await import('../utils/PlanPdfGenerator');
      
      const fileName = `ABBK_Plan_Formation_${formData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Generate and download
      generatePlanPDF(formData, fileName);
      
      // Get blob for upload
      const { getPlanPDFBlob } = await import('../utils/PlanPdfGenerator');
      const pdfBlob = getPlanPDFBlob(formData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Upload to pack
      const packId = formData.currentPackId;
      await uploadPDFToPack(
        pdfFile,
        'formation',
        'plan',
        formData.selectedClientId,
        formData,
        packId
      );
      
      showToast?.('Fiche Plan generated successfully!', 'success');
      
      // Show option to continue to Fiche Présence or finish
      if (window.confirm('Fiche Plan saved! Continue to Fiche de Présence?')) {
        setCurrentStep?.(6); // Will be Step 6: Présence
        alert('Step 6 (Fiche Présence) will be created next!');
      } else {
        showToast?.('You can continue this pack later from Saved page', 'info');
        resetForm?.();
        navigate('/saved');
      }
      
    } catch (error) {
      console.error('Error generating Plan PDF:', error);
      showToast?.('Error generating PDF: ' + error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueToPlan = () => {
    setShowPackModal(false);
    showToast?.('Moving to Fiche Plan de Formation...', 'info');
    updateFormData?.({ currentPackId: currentPackId });
    setCurrentStep?.(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndFinish = () => {
    setShowPackModal(false);
    showToast?.('Formation pack saved! You can continue it later from Saved page.', 'success');
    resetForm?.();
    navigate('/saved');
  };

  const handleCloseModal = () => {
    setShowPackModal(false);
    resetForm?.();
    navigate('/');
  };

  // Determine which buttons to show
  const isStep5 = currentStep === 5;
  const isLastMainStep = currentStep === totalSteps;

  return (
    <>
      <ErrorList errors={errors} />
      
      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {/* Step 5: Generate Plan PDF */}
        {isStep5 ? (
          <button
            onClick={handleGeneratePlanPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Download size={20} />
            {isGenerating ? 'Generating Plan...' : 'Generate Fiche Plan'}
          </button>
        ) : isLastMainStep ? (
          /* Step 4: Generate Programme PDF */
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            <Download size={20} />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        ) : (
          /* Steps 1-3: Next button */
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {showPackModal && (
        <FormationPackModal
          onContinue={handleContinueToPlan}
          onSaveAndFinish={handleSaveAndFinish}
          onClose={handleCloseModal}
        />
      )}
    </>
  );

}