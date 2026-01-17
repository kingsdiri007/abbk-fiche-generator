import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function Step7Evaluation() {
  const { t } = useLanguage();
  const { formData, updateFormData } = useFormContext();

  // FIXED: Auto-sync with presence data - runs every time we enter this step
  useEffect(() => {
    const presenceData = formData.presenceData || {};
    const planData = formData.planData?.formations?.[0] || {};
    
    // Get participant names from presence
    const participantNames = (presenceData.participants || [])
      .map(p => p.nom)
      .filter(name => name);
    
    if (participantNames.length === 0) {
      // No participants, create empty evaluation
      if (!formData.evaluationData) {
        updateFormData({
          evaluationData: {
            themeFormation: planData.formationName || presenceData.themeFormation || '',
            periodeDebut: presenceData.periodeDebut || '',
            periodeFin: presenceData.periodeFin || '',
            dureeFormation: presenceData.dureeFormation || planData.dureeFormation || '',
            formateur: presenceData.formateur || planData.formateur || '',
            evaluations: [{
              participantName: '',
              niveauInitial: '0',
              connaissancesTheoriques: '0',
              competencesPratiques: '0',
              niveauParticipation: '0',
              contributionDiscussions: '0',
              bonneComprehension: '0',
              capaciteAppliquer: '0',
              niveauCompetences: '0',
              attitudeGenerale: '0',
              participantPonctuel: '0',
              amelioration: '0'
            }],
            notes: "* Le formulaire d'évaluation est obligatoire et doit être envoyé uniquement aux coordonnateurs de la formation.",
            dateLe: presenceData.dateLe || new Date().toISOString().split('T')[0]
          }
        });
      }
      return;
    }

    // Sync participants from presence to evaluation
    const currentEvaluations = formData.evaluationData?.evaluations || [];
    const existingNames = currentEvaluations.map(e => e.participantName);
    
    // Create evaluations array matching ALL participants from presence
    const syncedEvaluations = participantNames.map(name => {
      // Find existing evaluation for this participant
      const existing = currentEvaluations.find(e => e.participantName === name);
      
      if (existing) {
        // Keep existing data
        return existing;
      } else {
        // Create new evaluation with default values of '0'
        return {
          participantName: name,
          niveauInitial: '0',
          connaissancesTheoriques: '0',
          competencesPratiques: '0',
          niveauParticipation: '0',
          contributionDiscussions: '0',
          bonneComprehension: '0',
          capaciteAppliquer: '0',
          niveauCompetences: '0',
          attitudeGenerale: '0',
          participantPonctuel: '0',
          amelioration: '0'
        };
      }
    });
    
    updateFormData({
      evaluationData: {
        themeFormation: planData.formationName || presenceData.themeFormation || formData.evaluationData?.themeFormation || '',
        periodeDebut: presenceData.periodeDebut || formData.evaluationData?.periodeDebut || '',
        periodeFin: presenceData.periodeFin || formData.evaluationData?.periodeFin || '',
        dureeFormation: presenceData.dureeFormation || planData.dureeFormation || formData.evaluationData?.dureeFormation || '',
        formateur: presenceData.formateur || planData.formateur || formData.evaluationData?.formateur || '',
        evaluations: syncedEvaluations,
        notes: formData.evaluationData?.notes || "* Le formulaire d'évaluation est obligatoire et doit être envoyé uniquement aux coordonnateurs de la formation.",
        dateLe: formData.evaluationData?.dateLe || presenceData.dateLe || new Date().toISOString().split('T')[0]
      }
    });
  }, [formData.presenceData]); // Re-sync when presence data changes

  const evaluationData = formData.evaluationData || {
    themeFormation: '',
    periodeDebut: '',
    periodeFin: '',
    dureeFormation: '',
    formateur: '',
    evaluations: [{
      participantName: '',
      niveauInitial: '0',
      connaissancesTheoriques: '0',
      competencesPratiques: '0',
      niveauParticipation: '0',
      contributionDiscussions: '0',
      bonneComprehension: '0',
      capaciteAppliquer: '0',
      niveauCompetences: '0',
      attitudeGenerale: '0',
      participantPonctuel: '0',
      amelioration: '0'
    }],
    notes: '',
    dateLe: ''
  };

  const updateEvaluationData = (updates) => {
    updateFormData({
      evaluationData: {
        ...evaluationData,
        ...updates
      }
    });
  };

  const updateEvaluation = (index, field, value) => {
    const newEvaluations = [...evaluationData.evaluations];
    newEvaluations[index][field] = value;
    updateEvaluationData({ evaluations: newEvaluations });
  };

  // FIXED: Calculate Note Général automatically as average of all criteria
  const calculateNoteGeneral = (evaluation) => {
    const fields = [
      'niveauInitial',
      'connaissancesTheoriques',
      'competencesPratiques',
      'niveauParticipation',
      'contributionDiscussions',
      'bonneComprehension',
      'capaciteAppliquer',
      'niveauCompetences',
      'attitudeGenerale',
      'participantPonctuel',
      'amelioration'
    ];
    
    const sum = fields.reduce((total, field) => {
      const value = parseFloat(evaluation[field]) || 0;
      return total + value;
    }, 0);
    
    // Return average rounded to 1 decimal place
    return (sum / fields.length).toFixed(1);
  };

  return (
    <div className="max-w-[98%] mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <div 
          className="text-white p-6 rounded-lg mb-8 -mx-8 -mt-8"
          style={{ backgroundColor: ABBK_COLORS.darkred }}
        >
          <h2 className="text-3xl font-bold text-center">{t('step7.title')}</h2>
          <h3 className="text-xl text-center mt-2">{t('step7.subtitle')}</h3>
          <p className="text-center text-sm mt-2 opacity-90">{t('step7.step')}</p>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 border-2 border-gray-800 dark:border-gray-600 text-sm transition-colors duration-300">
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step7.theme')}</label>
            <input
              type="text"
              value={evaluationData.themeFormation}
              onChange={(e) => updateEvaluationData({ themeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step7.periode')}</label>
            <div className="flex gap-2 mt-1">
              <input
                type="date"
                value={evaluationData.periodeDebut}
                onChange={(e) => updateEvaluationData({ periodeDebut: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
              />
              <span className="self-center text-gray-900 dark:text-white">à</span>
              <input
                type="date"
                value={evaluationData.periodeFin}
                onChange={(e) => updateEvaluationData({ periodeFin: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
              />
            </div>
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step7.duree')}</label>
            <input
              type="text"
              value={evaluationData.dureeFormation}
              onChange={(e) => updateEvaluationData({ dureeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step7.formateur')}</label>
            <input
              type="text"
              value={evaluationData.formateur}
              onChange={(e) => updateEvaluationData({ formateur: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Evaluation Table */}
        <div className="mb-6 overflow-x-auto border-2 border-gray-800 dark:border-gray-600 rounded-lg transition-colors duration-300">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 transition-colors duration-300">
                <th className="border-2 border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white" rowSpan="2" style={{minWidth: '200px'}}>
                  Critères d'évaluation
                </th>
                <th className="border-2 border-gray-800 dark:border-gray-600 p-2 text-center font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length}>
                  {t('step7.participants')}
                </th>
              </tr>
              <tr className="bg-gray-100 dark:bg-gray-600 transition-colors duration-300">
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <th key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-2 text-center font-bold text-gray-900 dark:text-white" style={{minWidth: '100px'}}>
                    {evaluation.participantName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Section 1: Informations sur le Niveau */}
              <tr className="bg-gray-300 dark:bg-gray-700 transition-colors duration-300">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length + 1}>
                  {t('step7.infoNiveau')}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.niveauInitial')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.niveauInitial}
                      onChange={(e) => updateEvaluation(idx, 'niveauInitial', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.connaissances')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.connaissancesTheoriques}
                      onChange={(e) => updateEvaluation(idx, 'connaissancesTheoriques', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.competencesPratiques')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.competencesPratiques}
                      onChange={(e) => updateEvaluation(idx, 'competencesPratiques', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>

              {/* Section 2: Participation et engagement */}
              <tr className="bg-gray-300 dark:bg-gray-700 transition-colors duration-300">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length + 1}>
                  {t('step7.participation')}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.niveauParticipation')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.niveauParticipation}
                      onChange={(e) => updateEvaluation(idx, 'niveauParticipation', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.contribution')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.contributionDiscussions}
                      onChange={(e) => updateEvaluation(idx, 'contributionDiscussions', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>

              {/* Section 3: Compréhension du contenu */}
              <tr className="bg-gray-300 dark:bg-gray-700 transition-colors duration-300">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length + 1}>
                  {t('step7.comprehension')}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.bonneComprehension')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.bonneComprehension}
                      onChange={(e) => updateEvaluation(idx, 'bonneComprehension', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.capaciteAppliquer')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.capaciteAppliquer}
                      onChange={(e) => updateEvaluation(idx, 'capaciteAppliquer', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.niveauCompetences')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.niveauCompetences}
                      onChange={(e) => updateEvaluation(idx, 'niveauCompetences', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.attitude')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.attitudeGenerale}
                      onChange={(e) => updateEvaluation(idx, 'attitudeGenerale', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.ponctuel')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.participantPonctuel}
                      onChange={(e) => updateEvaluation(idx, 'participantPonctuel', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.amelioration')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      value={evaluation.amelioration}
                      onChange={(e) => updateEvaluation(idx, 'amelioration', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>

              {/* Note Général row - AUTO-CALCULATED, READ-ONLY */}
              <tr className="bg-green-100 dark:bg-green-900 transition-colors duration-300">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white">{t('step7.noteGeneral')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <div className="w-full px-2 py-1 border-2 border-green-400 dark:border-green-600 rounded text-center font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300">
                      {calculateNoteGeneral(evaluation)}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('step7.note')}</h3>
          <textarea
            value={evaluationData.notes}
            onChange={(e) => updateEvaluationData({ notes: e.target.value })}
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 border-t-2 border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-300">
          <div>
            <label className="font-bold mb-2 block text-gray-900 dark:text-white">{t('step7.dateLe')}</label>
            <input
              type="date"
              value={evaluationData.dateLe}
              onChange={(e) => updateEvaluationData({ dateLe: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
            />
            <p className="font-bold mb-3 text-gray-900 dark:text-white">{t('step7.signatureFormateur')}</p>
            <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg transition-colors duration-300"></div>
          </div>
          <div>
            <p className="font-bold mb-3 mt-10 text-gray-900 dark:text-white">{t('step7.signatureABBK')}</p>
            <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg transition-colors duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}