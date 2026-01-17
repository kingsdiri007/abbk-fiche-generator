import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, X, CheckCircle, Clock } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { useLanguage } from '../context/LanguageContext';
import { ABBK_COLORS } from '../utils/theme';
import { downloadPDF, getPDFBlob } from '../utils/PdfGenerator';
import { uploadPDFToPack, getClientById } from '../services/supabaseService';
import { useNavigate } from 'react-router-dom';
import ErrorList from './ErrorList';
import { addStudentFormation } from '../services/supabaseService';
import { translateFormData } from '../services/translationService';
import { supabase } from '../supabase/client';

export default function NavigationButtons({ totalSteps = 3 }) {
  const { currentStep, goNext, goBack, formData, showToast, resetForm, setCurrentStep, updateFormData } = useFormContext();
  const { t, language} = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentFicheStep, setCurrentFicheStep] = useState(null);

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
        
      case 5:
        if (formData.interventionType === 'formation') {
          const participants = formData.presenceData?.participants || [];
          const hasValidParticipant = participants.some(p => p.nom && p.nom.trim() !== '');
          
          if (!hasValidParticipant) {
            stepErrors.push('Please add at least one participant with a name');
          }
        }
        break;
        
      case 6:
        if (formData.interventionType === 'formation') {
          if (!formData.evaluationData?.evaluations || formData.evaluationData.evaluations.length === 0) {
            stepErrors.push('Evaluation data is missing');
          }
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

  // Helper function to get full client data
  const getClientData = async (clientId) => {
    try {
      const client = await getClientById(clientId);
      return {
        clientName: client.name || '',
        address: client.address || '',
        id: client.id_client || '',
        phone: client.phone || client.telephone || ''
      };
    } catch (error) {
      console.error('Error fetching client:', error);
      return {
        clientName: formData.clientName || '',
        address: formData.address || '',
        id: clientId,
        phone: formData.phone || ''
      };
    }
  };

  const handleGeneratePDF = async () => {
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Get full client data
      showToast?.('Loading client information...', 'info');
      const clientData = await getClientData(formData.selectedClientId);
      
      // Merge client data with form data
      const completeFormData = {
        ...formData,
        ...clientData
      };
      
      // Translate for PDF if needed
      showToast?.('Preparing document...', 'info');
      const pdfFormData = language === 'en' 
        ? await translateFormData(completeFormData, 'en')
        : completeFormData;
      
      showToast?.('Generating PDF...', 'info');
      
      const fileName = downloadPDF(pdfFormData);
      const pdfBlob = getPDFBlob(pdfFormData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const ficheType = formData.interventionType;
      
      if (ficheType === 'formation') {
        // Step 1: Create the offre
        const { data: newOffre, error: offreError } = await supabase
          .from('offre')
          .insert([{
            id_client: formData.selectedClientId,
            type_offre: 'formation',
            date_creation: new Date().toISOString()
          }])
          .select()
          .single();

        if (offreError) {
          console.error('Offre creation error:', offreError);
          throw new Error('Error creating offre: ' + offreError.message);
        }

        // Step 2: Create the pack linked to this offre
        const { data: newPack, error: packError } = await supabase
          .from('pack')
          .insert([{
            id_offre: newOffre.id_offre,
            date_creation: new Date().toISOString()
          }])
          .select()
          .single();

        if (packError) {
          console.error('Pack creation error:', packError);
          throw new Error('Error creating pack: ' + packError.message);
        }

        // Step 3: Link formations to pack in pack_formations
        if (formData.selectedFormations && formData.selectedFormations.length > 0) {
          for (const formation_id of formData.selectedFormations) {
            const { error } = await supabase
              .from('pack_formations')
              .insert({
                id_pack: newPack.id_pack,
                formation_id: formation_id
              });

            if (error) {
              console.error('Pack-formation link error:', error);
            }
          }
        }

        // Step 4: Create fiches for this offre (5 fiches for formation)
        const ficheTypes = [1, 2, 3, 4, 5];
        for (const typeId of ficheTypes) {
          const { error: ficheError } = await supabase
            .from('fiche')
            .insert({
              id_offre: newOffre.id_offre,
              id_type_fiche: typeId,
              etat_fiche: typeId === 1 ? 'Terminé' : 'En cours',
              date_generation: typeId === 1 ? new Date().toISOString() : null
            });

          if (ficheError) {
            console.error('Fiche creation error:', ficheError);
          }
        }

        // Step 5: Upload the PDF for the first fiche (programme)
        const timestamp = Date.now();
        const sanitizedName = fileName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9.-]/g, '_');
        
        const { data: { user } } = await supabase.auth.getUser();
        const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(storagePath, pdfFile);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Error uploading PDF: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pdfs')
          .getPublicUrl(storagePath);

        // Update the first fiche with the PDF
        const { error: updateError } = await supabase
          .from('fiche')
          .update({
            url_pdf: publicUrl,
            storage_path: storagePath,
            form_data: completeFormData,
            etat_fiche: 'Terminé',
            date_generation: new Date().toISOString()
          })
          .eq('id_offre', newOffre.id_offre)
          .eq('id_type_fiche', 1);

        if (updateError) {
          console.error('Fiche update error:', updateError);
        }

        // Save offre and pack IDs to form data
        updateFormData?.({ 
          currentOffreId: newOffre.id_offre,
          currentPackId: newPack.id_pack,
          ...clientData
        });
        
        setCurrentFicheStep('programme');
        setShowStatusModal(true);
        showToast?.(`✅ PDF generated successfully in ${language.toUpperCase()}!`, 'success');
        
      } else {
        // LICENSE MODE
        const { data: newOffre, error: offreError } = await supabase
          .from('offre')
          .insert([{
            id_client: formData.selectedClientId,
            type_offre: 'licence',
            date_creation: new Date().toISOString()
          }])
          .select()
          .single();

        if (offreError) {
          console.error('Offre creation error:', offreError);
          throw new Error('Error creating offre: ' + offreError.message);
        }

        const { data: newPackLicence, error: packError } = await supabase
          .from('pack_licence')
          .insert([{
            id_offre: newOffre.id_offre,
            date_creation: new Date().toISOString()
          }])
          .select()
          .single();

        if (packError) {
          console.error('Pack licence creation error:', packError);
          throw new Error('Error creating pack licence: ' + packError.message);
        }

        // Link licenses
        if (formData.licenses && formData.licenses.length > 0) {
          for (const license of formData.licenses) {
            if (license.name) {
              const { data: licenseData, error: licenseError } = await supabase
                .from('licenses')
                .select('id_license')
                .eq('name', license.name)
                .maybeSingle();

              let licenseId;
              if (licenseData) {
                licenseId = licenseData.id_license;
              } else {
                const { data: newLicense, error: createError } = await supabase
                  .from('licenses')
                  .insert({ name: license.name })
                  .select()
                  .single();
                
                if (createError) {
                  console.error('License creation error:', createError);
                  continue;
                }
                licenseId = newLicense.id_license;
              }

              const { error } = await supabase
                .from('pack_licenses')
                .insert({
                  id_pack_licence: newPackLicence.id_pack_licence,
                  id_license: licenseId,
                  quantity: license.quantity || 1
                });

              if (error) {
                console.error('Pack-license link error:', error);
              }
            }
          }
        }

        // Create fiche for license
        const { error: ficheError } = await supabase
          .from('fiche')
          .insert({
            id_offre: newOffre.id_offre,
            id_type_fiche: 6,
            etat_fiche: 'Terminé',
            date_generation: new Date().toISOString()
          });

        if (ficheError) {
          console.error('Fiche creation error:', ficheError);
        }

        // Upload PDF
        const timestamp = Date.now();
        const sanitizedName = fileName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9.-]/g, '_');
        
        const { data: { user } } = await supabase.auth.getUser();
        const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(storagePath, pdfFile);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Error uploading PDF: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pdfs')
          .getPublicUrl(storagePath);

        const { error: updateError } = await supabase
          .from('fiche')
          .update({
            url_pdf: publicUrl,
            storage_path: storagePath,
            form_data: completeFormData,
            etat_fiche: 'Terminé',
            date_generation: new Date().toISOString()
          })
          .eq('id_offre', newOffre.id_offre)
          .eq('id_type_fiche', 6);

        if (updateError) {
          console.error('Fiche update error:', updateError);
        }

        showToast?.(`✅ PDF generated and saved in ${language.toUpperCase()}!`, 'success');
        
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

  const handleMarkFicheStatus = async (status) => {
    if (!formData.currentOffreId || !currentFicheStep) return;
    
    try {
      const ficheTypeMap = {
        'programme': 1,
        'plan': 2,
        'presence': 3,
        'evaluation': 4
      };
      
      const id_type_fiche = ficheTypeMap[currentFicheStep];

      const { error } = await supabase
        .from('fiche')
        .update({ 
          etat_fiche: status === 'done' ? 'Terminé' : 'En cours'
        })
        .eq('id_offre', formData.currentOffreId)
        .eq('id_type_fiche', id_type_fiche);

      if (error) {
        console.error('Error updating fiche status:', error);
        throw new Error(error.message);
      }

      if (status === 'done') {
        showToast?.(`Fiche marked as complete! ✅`, 'success');
        setShowStatusModal(false);
        
        if (currentFicheStep === 'programme') {
          showToast?.('Moving to Fiche Plan de Formation...', 'info');
          setCurrentStep?.(4);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentFicheStep === 'plan') {
          showToast?.('Moving to Fiche de Présence...', 'info');
          setCurrentStep?.(5);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentFicheStep === 'presence') {
          showToast?.('Moving to Fiche d\'Évaluation...', 'info');
          setCurrentStep?.(6);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentFicheStep === 'evaluation') {
          showToast?.('🎉 Formation Pack Complete! All fiches done!', 'success');
          setTimeout(() => {
            resetForm?.();
            navigate('/saved');
          }, 2000);
        }
      } else if (status === 'in_progress') {
        showToast?.(`Document saved as pending! 📝`, 'info');
        setShowStatusModal(false);
        setTimeout(() => {
          resetForm?.();
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating fiche status:', error);
      showToast?.('Error updating status: ' + error.message, 'error');
    }
  };

  const handleGeneratePlanPDF = async () => {
    if (!validateCurrentStep()) {
      showToast?.('Please complete all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      const clientData = await getClientData(formData.selectedClientId);
      const completeFormData = { ...formData, ...clientData };
      
      const { generatePlanPDF, getPlanPDFBlob } = await import('../utils/PlanPdfGenerator');
      
      const fileName = `ABBK_Plan_Formation_${clientData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      generatePlanPDF(completeFormData, fileName);
      
      const pdfBlob = getPlanPDFBlob(completeFormData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Upload and update fiche
      const timestamp = Date.now();
      const sanitizedName = fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_');
      
      const { data: { user } } = await supabase.auth.getUser();
      const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('fiche')
        .upload(storagePath, pdfFile);
      
      if (uploadError) throw new Error('Error uploading PDF: ' + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(storagePath);

      await supabase
        .from('fiche')
        .update({
          url_pdf: publicUrl,
          storage_path: storagePath,
          form_data: completeFormData,
          date_generation: new Date().toISOString()
        })
        .eq('id_offre', formData.currentOffreId)
        .eq('id_type_fiche', 2);
      
      setCurrentFicheStep('plan');
      setShowStatusModal(true);
      showToast?.('Fiche Plan generated successfully!', 'success');
      
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
      const clientData = await getClientData(formData.selectedClientId);
      const completeFormData = { ...formData, ...clientData };
      
      const { generatePresencePDF, getPresencePDFBlob } = await import('../utils/PresencePdfGenerator');
      
      const fileName = `ABBK_Presence_${clientData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      generatePresencePDF(completeFormData, fileName);
      
      const pdfBlob = getPresencePDFBlob(completeFormData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const timestamp = Date.now();
      const sanitizedName = fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_');
      
      const { data: { user } } = await supabase.auth.getUser();
      const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(storagePath, pdfFile);
      
      if (uploadError) throw new Error('Error uploading PDF: ' + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(storagePath);

      await supabase
        .from('fiche')
        .update({
          url_pdf: publicUrl,
          storage_path: storagePath,
          form_data: completeFormData,
          date_generation: new Date().toISOString()
        })
        .eq('id_offre', formData.currentOffreId)
        .eq('id_type_fiche', 3);
      
      setCurrentFicheStep('presence');
      setShowStatusModal(true);
      showToast?.('Fiche Présence generated successfully!', 'success');
      
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
      const clientData = await getClientData(formData.selectedClientId);
      const completeFormData = { ...formData, ...clientData };
      
      const { generateEvaluationPDF, getEvaluationPDFBlob } = await import('../utils/EvaluationPdfGenerator');
      
      const fileName = `ABBK_Evaluation_${clientData.clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      generateEvaluationPDF(completeFormData, fileName);
      
      const pdfBlob = getEvaluationPDFBlob(completeFormData);
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const timestamp = Date.now();
      const sanitizedName = fileName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.-]/g, '_');
      
      const { data: { user } } = await supabase.auth.getUser();
      const storagePath = `${user.id}/${timestamp}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(storagePath, pdfFile);
      
      if (uploadError) throw new Error('Error uploading PDF: ' + uploadError.message);

      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(storagePath);

      await supabase
        .from('fiche')
        .update({
          url_pdf: publicUrl,
          storage_path: storagePath,
          form_data: completeFormData,
          date_generation: new Date().toISOString()
        })
        .eq('id_offre', formData.currentOffreId)
        .eq('id_type_fiche', 4);

      // Save student evaluations
      if (formData.evaluationData?.evaluations && formData.presenceData?.participants) {
        const completionDate = formData.evaluationData.dateLe || new Date().toISOString().split('T')[0];
        const formationName = formData.evaluationData.themeFormation || 'Formation';
        
        for (let i = 0; i < formData.evaluationData.evaluations.length; i++) {
          const evaluation = formData.evaluationData.evaluations[i];
          const participant = formData.presenceData.participants.find(p => p.nom === evaluation.participantName);
          
          if (participant?.studentId) {
            try {
              const fields = [
                'niveauInitial', 'connaissancesTheoriques', 'competencesPratiques',
                'niveauParticipation', 'contributionDiscussions', 'bonneComprehension',
                'capaciteAppliquer', 'niveauCompetences', 'attitudeGenerale',
                'participantPonctuel', 'amelioration'
              ];
              
              const sum = fields.reduce((total, field) => {
                return total + (parseFloat(evaluation[field]) || 0);
              }, 0);
              
              const noteGeneral = (sum / fields.length).toFixed(1);
              
              await addStudentFormation(participant.studentId, {
                formationName: formationName,
                noteGeneral: parseFloat(noteGeneral),
                completionDate: completionDate,
                evaluationDetails: evaluation
              });
            } catch (error) {
              console.error(`Error saving student formation for ${evaluation.participantName}:`, error);
            }
          }
        }
      }
      
      setCurrentFicheStep('evaluation');
      setShowStatusModal(true);
      showToast?.('🎉 Evaluation PDF generated! Choose your action.', 'success');
      
    } catch (error) {
      console.error('Error generating Evaluation PDF:', error);
      showToast?.('Error generating PDF: ' + error.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const isStep4 = currentStep === 4;
  const isStep5 = currentStep === 5;
  const isStep6 = currentStep === 6;
  const isLastMainStep = currentStep === totalSteps;

  return (
    <>
      <ErrorList errors={errors} />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
            <button
              onClick={goBack}
              disabled={currentStep === 1}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={20} />
              <span className="hidden sm:inline">{t('nav.back')}</span>
              <span className="sm:hidden">Back</span>
            </button>

            {isStep6 ? (
              <button
                onClick={handleGenerateEvaluationPDF}
                disabled={isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
                style={{ 
                  backgroundColor: isGenerating ? ABBK_COLORS.gray : ABBK_COLORS.red,
                }}
              >
                <Download size={20} />
                <span className="text-sm sm:text-base">
                  {isGenerating ? t('nav.completingPack') : t('nav.completePack')}
                </span>
              </button>
            ) : isStep5 ? (
              <button
                onClick={handleGeneratePresencePDF}
                disabled={isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
                style={{ backgroundColor: '#10b981' }}
              >
                <Download size={20} />
                <span className="text-sm sm:text-base">
                  {isGenerating ? t('nav.generating') : t('nav.generateFichePresence')}
                </span>
              </button>
            ) : isStep4 ? (
              <button
                onClick={handleGeneratePlanPDF}
                disabled={isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
                style={{ backgroundColor: '#9333ea' }}
              >
                <Download size={20} />
                <span className="text-sm sm:text-base">
                  {isGenerating ? t('nav.generatingPlan') : t('nav.generateFichePlan')}
                </span>
              </button>
            ) : isLastMainStep ? (
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-medium transition disabled:opacity-50 shadow-md"
                style={{ backgroundColor: '#10b981' }}
              >
                <Download size={20} />
                <span className="text-sm sm:text-base">
                  {isGenerating ? t('nav.generating') : t('nav.downloadPdf')}
                </span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-medium transition shadow-md"
                style={{ backgroundColor: ABBK_COLORS.red }}
              >
                <span className="text-sm sm:text-base">{t('nav.next')}</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full relative animate-fade-in">
            <div className="px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                  <CheckCircle size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  PDF Generated Successfully
                </h2>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-13">
                Choose your next action
              </p>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => handleMarkFicheStatus('done')}
                className="w-full flex items-center gap-3 px-4 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-500 transition">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Mark as Complete</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Document approved, proceed to next step</div>
                </div>
              </button>

              <button
                onClick={() => handleMarkFicheStatus('in_progress')}
                className="w-full flex items-center gap-3 px-4 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center group-hover:bg-yellow-500 transition">
                  <Clock size={20} className="text-yellow-600 dark:text-yellow-400 group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900 dark:text-white">Save & Continue Later</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Save as pending and return home</div>
                </div>
              </button>
            </div>

            <div className="px-6 pb-6">
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                Both options save your progress. You can continue from the Saved page anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}