import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { useLanguage } from '../context/LanguageContext';
import { ABBK_COLORS } from '../utils/theme';
import { downloadPDF, getPDFBlob } from '../utils/PdfGenerator';
import { uploadPDFToPack, createFormationPack } from '../services/supabaseService';
import { useNavigate } from 'react-router-dom';
import ErrorList from './ErrorList';

export default function NavigationButtons({ totalSteps = 3 }) {
  const { currentStep, goNext, goBack, formData, showToast, resetForm, setCurrentStep, updateFormData } = useFormContext();
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPackModal, setShowPackModal] = useState(false);
  const [modalStep, setModalStep] = useState('programme');
  const navigate = useNavigate();

  const validateCurrentStep = () => {
    const stepErrors = [];
    
    switch (currentStep) {
      case 1:
        if (!formData.selectedClientId) stepErrors.push('Please select a client');
        if (!formData.referenceBC) stepErrors.push('Please enter Reference BC');
        if (!formData.interventionDate) stepErrors.push('Please select intervention date');
        if (!formData.location) stepErrors.push('Please enter location');
        if (!formData.interventionType) stepErrors.push('Please select intervention type (Formation or License)');
        break;
      case 2:
        if (formData.interventionType === 'formation') {
          if (!formData.selectedFormations || formData.selectedFormations.length === 0) {
            stepErrors.push('Please select at least one formation');
          }
        } else if (formData.interventionType === 'license') {
          if (!formData.intervenant) stepErrors.push('Please select an intervenant for license installation');
          const validLicenses = formData.licenses.filter(lic => lic.name && lic.quantity);
          if (validLicenses.length === 0) stepErrors.push('Please add at least one license');
        }
        break;
      case 3:
        // Preview - all validation done
        break;
      case 4:
        if (!formData.planData?.formations?.[0]?.formationName) {
          stepErrors.push('Please fill in at least one formation name');
        }
        break;
      case 5:
        if (!formData.presenceData?.participants?.[0]?.nom) {
          stepErrors.push('Please add at least one participant');
        }
        break;
      case 6:
        if (!formData.evaluationData?.evaluations?.[0]) {
          stepErrors.push('Evaluation data is missing');
        }
        break;
    }

    setErrors(stepErrors);
    return stepErrors.length === 0;
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
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const fileName = downloadPDF(formData);
      
      const pdfBlob = getPDFBlob(formData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const ficheType = formData.interventionType;
      
      if (ficheType === 'formation') {
        const packData = {
          pack_name: `Formation ${formData.clientName} - ${new Date().toLocaleDateString()}`,
          client_id: formData.selectedClientId,
          formation_ids: formData.selectedFormations || [],
          form_data: formData
        };
        
        const pack = await createFormationPack(packData);
        
        await uploadPDFToPack(
          pdfFile,
          'formation',
          'programme',
          formData.selectedClientId,
          formData,
          pack.id
        );
        
        showToast?.(`PDF generated successfully! File: ${fileName}`, 'success');
        updateFormData?.({ currentPackId: pack.id });
        setModalStep('programme');
        setShowPackModal(true);
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

  const handleGeneratePlanPDF = async () => {
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { generatePlanPDF, getPlanPDFBlob } = await import('../utils/PlanPdfGenerator');
      
      const fileName = `ABBK_Plan_Formation_${formData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      generatePlanPDF(formData, fileName);
      
      const pdfBlob = getPlanPDFBlob(formData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
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
      setModalStep('plan');
      setShowPackModal(true);
      
    } catch (error) {
      console.error('Error generating Plan PDF:', error);
      showToast?.('Error generating PDF: ' + error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePresencePDF = async () => {
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { generatePresencePDF, getPresencePDFBlob } = await import('../utils/PresencePdfGenerator');
      
      const fileName = `ABBK_Presence_${formData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      generatePresencePDF(formData, fileName);
      
      const pdfBlob = getPresencePDFBlob(formData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const packId = formData.currentPackId;
      await uploadPDFToPack(
        pdfFile,
        'formation',
        'presence',
        formData.selectedClientId,
        formData,
        packId
      );
      
      showToast?.('Fiche Présence generated successfully!', 'success');
      setModalStep('presence');
      setShowPackModal(true);
      
    } catch (error) {
      console.error('Error generating Présence PDF:', error);
      showToast?.('Error generating PDF: ' + error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEvaluationPDF = async () => {
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { generateEvaluationPDF, getEvaluationPDFBlob } = await import('../utils/EvaluationPdfGenerator');
      
      const fileName = `ABBK_Evaluation_${formData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      generateEvaluationPDF(formData, fileName);
      
      const pdfBlob = getEvaluationPDFBlob(formData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const packId = formData.currentPackId;
      await uploadPDFToPack(
        pdfFile,
        'formation',
        'evaluation',
        formData.selectedClientId,
        formData,
        packId
      );
      
      showToast?.('🎉 Formation Pack Complete! All 4 fiches generated!', 'success');
      
      setTimeout(() => {
        resetForm?.();
        navigate('/saved');
      }, 2000);
      
    } catch (error) {
      console.error('Error generating Evaluation PDF:', error);
      showToast?.('Error generating PDF: ' + error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueToNext = () => {
    setShowPackModal(false);
    
    if (modalStep === 'programme') {
      showToast?.('Moving to Fiche Plan de Formation...', 'info');
      setCurrentStep?.(4);
    } else if (modalStep === 'plan') {
      showToast?.('Moving to Fiche de Présence...', 'info');
      setCurrentStep?.(5);
    } else if (modalStep === 'presence') {
      showToast?.('Moving to Fiche d\'Évaluation...', 'info');
      setCurrentStep?.(6);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveAndFinish = () => {
    setShowPackModal(false);
    showToast?.('Formation pack saved! You can continue it later from Saved page.', 'success');
    resetForm?.();
    navigate('/saved');
  };

  const getModalTitle = () => {
    if (modalStep === 'programme') return 'Fiche Programme';
    if (modalStep === 'plan') return 'Fiche Plan de Formation';
    if (modalStep === 'presence') return 'Fiche de Présence';
    return '';
  };

  const getNextStepName = () => {
    if (modalStep === 'programme') return 'Fiche Plan de Formation';
    if (modalStep === 'plan') return 'Fiche de Présence';
    if (modalStep === 'presence') return 'Fiche d\'Évaluation';
    return '';
  };

  const isStep4 = currentStep === 4;
  const isStep5 = currentStep === 5;
  const isStep6 = currentStep === 6;
  const isLastMainStep = currentStep === totalSteps;

  return (
    <>
      <ErrorList errors={errors} />
      
      <div className="flex justify-between mt-8">
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={20} />
          Back
        </button>

        {isStep6 ? (
          <button
            onClick={handleGenerateEvaluationPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ 
              backgroundColor: isGenerating ? ABBK_COLORS.gray : ABBK_COLORS.red,
            }}
            onMouseEnter={(e) => !isGenerating && (e.target.style.backgroundColor = ABBK_COLORS.darkred)}
            onMouseLeave={(e) => !isGenerating && (e.target.style.backgroundColor = ABBK_COLORS.red)}
          >
            <Download size={20} />
            {isGenerating ? 'Completing Pack...' : 'Complete Formation Pack'}
          </button>
        ) : isStep5 ? (
          <button
            onClick={handleGeneratePresencePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#10b981' }}
          >
            <Download size={20} />
            {isGenerating ? 'Generating...' : 'Generate Fiche Présence'}
          </button>
        ) : isStep4 ? (
          <button
            onClick={handleGeneratePlanPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#9333ea' }}
          >
            <Download size={20} />
            {isGenerating ? 'Generating...' : 'Generate Fiche Plan'}
          </button>
        ) : isLastMainStep ? (
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#10b981' }}
          >
            <Download size={20} />
            {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition shadow-md"
            style={{ backgroundColor: ABBK_COLORS.red }}
            onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
            onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {showPackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {getModalTitle()} Generated! ✅
            </h2>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={handleContinueToNext}
                className="w-full px-6 py-4 text-white rounded-lg font-semibold transition shadow-md"
                style={{ backgroundColor: ABBK_COLORS.red }}
                onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
              >
                Continue to {getNextStepName()}
              </button>

              <button
                onClick={handleSaveAndFinish}
                className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition"
              >
                Save & Finish Later
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              You can continue this pack from the Saved page
            </p>
          </div>
        </div>
      )}
    </>
  );
}