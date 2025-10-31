import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function Step7Evaluation() {
  const { t } = useLanguage();
  const { formData, updateFormData } = useFormContext();

  // Auto-fill from previous steps
  useEffect(() => {
    if (!formData.evaluationData) {
      const presenceData = formData.presenceData || {};
      const planData = formData.planData?.formations?.[0] || {};
      
      // Get participant names from presence
      const participantNames = (presenceData.participants || [])
        .map(p => p.nom)
        .filter(name => name);
      
      // Create evaluation rows for each participant
      const evaluations = participantNames.map(name => ({
        participantName: name,
        niveauInitial: '',
        connaissancesTheoriques: '',
        competencesPratiques: '',
        niveauParticipation: '',
        contributionDiscussions: '',
        bonneComprehension: '',
        capaciteAppliquer: '',
        niveauCompetences: '',
        attitudeGenerale: '',
        participantPonctuel: '',
        amelioration: ''
      }));
      
      updateFormData({
        evaluationData: {
          themeFormation: planData.formationName || presenceData.themeFormation || '',
          periodeDebut: presenceData.periodeDebut || '',
          periodeFin: presenceData.periodeFin || '',
          dureeFormation: presenceData.dureeFormation || planData.dureeFormation || '',
          formateur: presenceData.formateur || planData.formateur || '',
          evaluations: evaluations.length > 0 ? evaluations : [{
            participantName: '',
            niveauInitial: '',
            connaissancesTheoriques: '',
            competencesPratiques: '',
            niveauParticipation: '',
            contributionDiscussions: '',
            bonneComprehension: '',
            capaciteAppliquer: '',
            niveauCompetences: '',
            attitudeGenerale: '',
            participantPonctuel: '',
            amelioration: ''
          }],
          noteGeneral: Array(8).fill('0'),
          notes: "* Le formulaire d'évaluation est obligatoire et doit être envoyé uniquement aux coordonnateurs de la formation.",
          dateLe: presenceData.dateLe || new Date().toISOString().split('T')[0]
        }
      });
    }
  }, []);

  const evaluationData = formData.evaluationData || {
    themeFormation: '',
    periodeDebut: '',
    periodeFin: '',
    dureeFormation: '',
    formateur: '',
    evaluations: [{
      participantName: '',
      niveauInitial: '',
      connaissancesTheoriques: '',
      competencesPratiques: '',
      niveauParticipation: '',
      contributionDiscussions: '',
      bonneComprehension: '',
      capaciteAppliquer: '',
      niveauCompetences: '',
      attitudeGenerale: '',
      participantPonctuel: '',
      amelioration: ''
    }],
    noteGeneral: Array(8).fill('0'),
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

  const updateNoteGeneral = (index, value) => {
    const newNotes = [...evaluationData.noteGeneral];
    newNotes[index] = value;
    updateEvaluationData({ noteGeneral: newNotes });
  };

  const criteria = [
    { field: 'niveauInitial', label: t('step7.niveauInitial') },
    { field: 'connaissancesTheoriques', label: t('step7.connaissances') },
    { field: 'competencesPratiques', label: t('step7.competencesPratiques') },
    { field: 'niveauParticipation', label: t('step7.niveauParticipation') },
    { field: 'contributionDiscussions', label: t('step7.contribution') },
    { field: 'bonneComprehension', label: t('step7.bonneComprehension') },
    { field: 'capaciteAppliquer', label: t('step7.capaciteAppliquer') },
    { field: 'niveauCompetences', label: t('step7.niveauCompetences') },
    { field: 'attitudeGenerale', label: t('step7.attitude') },
    { field: 'participantPonctuel', label: t('step7.ponctuel') },
    { field: 'amelioration', label: t('step7.amelioration') }
  ];

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
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 border-2 border-gray-800 dark:border-gray-600 text-sm">
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
        <div className="mb-6 overflow-x-auto border-2 border-gray-800 dark:border-gray-600 rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700">
                <th className="border-2 border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white" rowSpan="2" style={{minWidth: '200px'}}>
                  
                </th>
                <th className="border-2 border-gray-800 dark:border-gray-600 p-2 text-center font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length}>
                  {t('step7.participants')}
                </th>
              </tr>
              <tr className="bg-gray-100 dark:bg-gray-600">
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <th key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-2 text-center font-bold text-gray-900 dark:text-white" style={{minWidth: '100px'}}>
                    {evaluation.participantName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Section 1: Informations sur le Niveau */}
              <tr className="bg-gray-300 dark:bg-gray-700">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length + 1}>
                  {t('step7.infoNiveau')}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.niveauInitial')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="text"
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
                      type="text"
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
                      type="text"
                      value={evaluation.competencesPratiques}
                      onChange={(e) => updateEvaluation(idx, 'competencesPratiques', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>

              {/* Section 2: Participation et engagement */}
              <tr className="bg-gray-300 dark:bg-gray-700">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length + 1}>
                  {t('step7.participation')}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.niveauParticipation')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="text"
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
                      type="text"
                      value={evaluation.contributionDiscussions}
                      onChange={(e) => updateEvaluation(idx, 'contributionDiscussions', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>

              {/* Section 3: Compréhension du contenu */}
              <tr className="bg-gray-300 dark:bg-gray-700">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white" colSpan={evaluationData.evaluations.length + 1}>
                  {t('step7.comprehension')}
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-semibold text-gray-900 dark:text-white">{t('step7.bonneComprehension')}</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="text"
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
                      type="text"
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
                      type="text"
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
                      type="text"
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
                      type="text"
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
                      type="text"
                      value={evaluation.amelioration}
                      onChange={(e) => updateEvaluation(idx, 'amelioration', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                    />
                  </td>
                ))}
              </tr>

              {/* Note Général Row */}
              <tr className="bg-green-100 dark:bg-green-900">
                <td className="border-2 border-gray-800 dark:border-gray-600 p-2 font-bold text-gray-900 dark:text-white">{t('step7.noteGeneral')}</td>
                {evaluationData.noteGeneral.slice(0, evaluationData.evaluations.length).map((note, idx) => (
                  <td key={idx} className="border-2 border-gray-800 dark:border-gray-600 p-1">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => updateNoteGeneral(idx, e.target.value)}
                      className="w-full px-2 py-1 border-2 border-green-400 dark:border-green-600 rounded text-center font-bold bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                    />
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
        <div className="grid grid-cols-2 gap-8 border-t-2 pt-6">
          <div>
            <label className="font-bold mb-2 block text-gray-900 dark:text-white">{t('step7.dateLe')}</label>
            <input
              type="date"
              value={evaluationData.dateLe}
              onChange={(e) => updateEvaluationData({ dateLe: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
            />
            <p className="font-bold mb-3 text-gray-900 dark:text-white">{t('step7.signatureFormateur')}</p>
            <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg"></div>
          </div>
          <div>
            <p className="font-bold mb-3 mt-10 text-gray-900 dark:text-white">{t('step7.signatureABBK')}</p>
            <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}