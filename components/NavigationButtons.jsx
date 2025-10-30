import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { useLanguage } from '../context/LanguageContext';
import { ABBK_COLORS } from '../utils/theme';
import { downloadPDF, getPDFBlob } from '../utils/PdfGenerator';
import { uploadPDFToPack, createFormationPack } from '../services/supabaseService';
import { validateStep1, validateStep2, validateStep3, validateAllSteps } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import ErrorList from './ErrorList';

export default function NavigationButtons({ totalSteps = 4 }) {
  const { currentStep, goNext, goBack, formData, showToast, resetForm, setCurrentStep, updateFormData } = useFormContext();
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPackModal, setShowPackModal] = useState(false);
  const [currentPackId, setCurrentPackId] = useState(null);
  const [modalStep, setModalStep] = useState('programme');
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
        const planErrors = [];
        if (!formData.planData?.formations?.[0]?.formationName) {
          planErrors.push(t('error.fillFormationName') || 'Please fill in at least one formation name');
        }
        validation = { isValid: planErrors.length === 0, errors: planErrors };
        break;
      case 6:
        const presenceErrors = [];
        if (!formData.presenceData?.participants?.[0]?.nom) {
          presenceErrors.push(t('error.addParticipant') || 'Please add at least one participant');
        }
        validation = { isValid: presenceErrors.length === 0, errors: presenceErrors };
        break;
      case 7:
        const evaluationErrors = [];
        if (!formData.evaluationData?.evaluations?.[0]) {
          evaluationErrors.push(t('error.evaluationMissing') || 'Evaluation data is missing');
        }
        validation = { isValid: evaluationErrors.length === 0, errors: evaluationErrors };
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
      showToast?.(t('common.success') || 'Step completed successfully!', 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      showToast?.(t('error.fixErrors'), 'error');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGeneratePDF = async () => {
    const validation = validateAllSteps(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast?.(t('error.fillRequired'), 'error');
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
        const packData = {
          pack_name: `Formation ${formData.clientName} - ${new Date().toLocaleDateString()}`,
          client_id: formData.selectedClientId,
          formation_ids: formData.selectedFormations || [],
          form_data: formData
        };
        
        const pack = await createFormationPack(packData);
        setCurrentPackId(pack.id);
        
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
      showToast?.(t('error.fillRequired'), 'error');
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
      showToast?.(t('error.fillRequired'), 'error');
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
      showToast?.(t('error.fillRequired'), 'error');
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
      setCurrentStep?.(5);
    } else if (modalStep === 'plan') {
      showToast?.('Moving to Fiche de Présence...', 'info');
      setCurrentStep?.(6);
    } else if (modalStep === 'presence') {
      showToast?.('Moving to Fiche d\'Évaluation...', 'info');
      setCurrentStep?.(7);
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

  const isStep5 = currentStep === 5;
  const isStep6 = currentStep === 6;
  const isStep7 = currentStep === 7;
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
          {t('nav.back')}
        </button>

        {isStep7 ? (
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
            {isGenerating ? t('nav.completingPack') : t('nav.completePack')}
          </button>
        ) : isStep6 ? (
          <button
            onClick={handleGeneratePresencePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#10b981' }}
          >
            <Download size={20} />
            {isGenerating ? t('nav.generating') : t('nav.generateFichePresence')}
          </button>
        ) : isStep5 ? (
          <button
            onClick={handleGeneratePlanPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#9333ea' }}
          >
            <Download size={20} />
            {isGenerating ? t('nav.generatingPlan') : t('nav.generateFichePlan')}
          </button>
        ) : isLastMainStep ? (
          <button
            onClick={handleGeneratePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
            style={{ backgroundColor: '#10b981' }}
          >
            <Download size={20} />
            {isGenerating ? t('nav.generating') : t('nav.downloadPdf')}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition shadow-md"
            style={{ backgroundColor: ABBK_COLORS.red }}
            onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
            onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
          >
            {t('nav.next')}
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {showPackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {getModalTitle()} {t('common.generated')}! ✅
            </h2>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={handleContinueToNext}
                className="w-full px-6 py-4 text-white rounded-lg font-semibold transition shadow-md"
                style={{ backgroundColor: ABBK_COLORS.red }}
                onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
              >
                {t('nav.continueTo')} {getNextStepName()}
              </button>

              <button
                onClick={handleSaveAndFinish}
                className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold transition"
              >
                {t('nav.saveFinish')}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('nav.continueFromSaved')}
            </p>
          </div>
        </div>
      )}
    </>
  );
}