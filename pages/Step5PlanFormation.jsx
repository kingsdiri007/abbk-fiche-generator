import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';
import { getAllIntervenants, getAllFormations } from '../services/supabaseService';

export default function Step5PlanFormation() {
  const { t } = useLanguage();
  const { formData, updateFormData } = useFormContext();
  const [intervenants, setIntervenants] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define planData early to avoid reference errors
  const planData = formData.planData || {
    formations: [],
    details: '',
    notes: 'Le planning est fixé, aucun changement à prévoir.\nToutes les dates sont fixées en fonction de la disponibilité de :\nLa fiche de présence est obligatoire et doit être signée par le formateur ainsi que par . N\'oubliez pas de prendre des photos, après avoir obtenu les autorisations nécessaires.',
    contactNote: 'Notre contact à :',
    dateSignature: formData.interventionDate || ''
  };

  const updatePlanData = (updates) => {
    updateFormData({
      planData: {
        ...planData,
        ...updates
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [intervenantsData, formationsData] = await Promise.all([
        getAllIntervenants(),
        getAllFormations()
      ]);
      setIntervenants(intervenantsData);
      setFormations(formationsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
// Update the autoGeneratePlanRows function - remove details from each row
const autoGeneratePlanRows = () => {
  const rows = [];
  let currentDate = new Date(formData.interventionDate || new Date());

  (formData.selectedFormations || []).forEach(formationId => {
    const formationData = formData.formationsData[formationId];
    if (!formationData || !formationData.schedule) return;

    const schedule = formationData.schedule;
    let i = 0;

    while (i < schedule.length) {
      const currentIntervenant = schedule[i].intervenant;
      let consecutiveDays = 1;
      let totalTheory = parseFloat(schedule[i].theoryHours) || 0;
      let totalPractice = parseFloat(schedule[i].practiceHours) || 0;

      while (
        i + consecutiveDays < schedule.length &&
        schedule[i + consecutiveDays].intervenant === currentIntervenant
      ) {
        totalTheory += parseFloat(schedule[i + consecutiveDays].theoryHours) || 0;
        totalPractice += parseFloat(schedule[i + consecutiveDays].practiceHours) || 0;
        consecutiveDays++;
      }

      const totalHours = totalTheory + totalPractice;
      const dateDebut = new Date(currentDate);
      const dateFin = new Date(currentDate);
      dateFin.setDate(dateFin.getDate() + consecutiveDays);

      rows.push({
        formationName: formationData.formationName || '',
        formateur: currentIntervenant || '',
        nombreJours: consecutiveDays.toString(),
        dureeFormation: `${totalHours}h`,
        lieuFormation: formData.location || '',
        dateDebut: dateDebut.toISOString().split('T')[0],
        dateFin: dateFin.toISOString().split('T')[0],
        heuresFormation: '9h - 17h'
        // REMOVED: details field
      });

      currentDate.setDate(currentDate.getDate() + consecutiveDays + 1);
      i += consecutiveDays;
    }
  });

  updateFormData({
    planData: {
      ...(formData.planData || {}),
      formations: rows
      // details is kept separately, not in individual rows
    }
  });
};

 // In the useEffect that sets default data, remove details from formations
useEffect(() => {
  if (!loading && !formData.planData && formData.selectedFormations && formData.selectedFormations.length > 0) {
    const defaultPlanData = {
      formations: [],
      details: '', // This stays as the single details field
      notes: 'Le planning est fixé, aucun changement à prévoir.\nToutes les dates sont fixées en fonction de la disponibilité de :\nLa fiche de présence est obligatoire et doit être signée par le formateur ainsi que par . N\'oubliez pas de prendre des photos, après avoir obtenu les autorisations nécessaires.',
      contactNote: 'Notre contact à :',
      dateSignature: formData.interventionDate || ''
    };
    
    updateFormData({ planData: defaultPlanData });
    setTimeout(() => autoGeneratePlanRows(), 100);
  }
}, [loading, formData.selectedFormations]);

 

 // Update the addFormationRow function - remove details from new rows
const addFormationRow = () => {
  updatePlanData({
    formations: [
      ...planData.formations,
      {
        formationName: '',
        formateur: '',
        nombreJours: '',
        dureeFormation: '',
        lieuFormation: formData.location || '',
        dateDebut: '',
        dateFin: '',
        heuresFormation: '9h - 17h'
        // REMOVED: details field
      }
    ]
  });
};

  const removeFormationRow = (index) => {
    if (planData.formations.length > 1) {
      updatePlanData({
        formations: planData.formations.filter((_, i) => i !== index)
      });
    }
  };

  const updateFormation = (index, field, value) => {
    const newFormations = [...planData.formations];
    newFormations[index][field] = value;

    if (field === 'nombreJours' || field === 'dateDebut') {
      const dateDebut = newFormations[index].dateDebut;
      const nombreJours = parseInt(newFormations[index].nombreJours) || 0;

      if (dateDebut && nombreJours > 0) {
        const startDate = new Date(dateDebut);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + nombreJours + 1);
        newFormations[index].dateFin = endDate.toISOString().split('T')[0];
      }
    }

    updatePlanData({ formations: newFormations });
  };

  if (loading) {
    return (
      <div className="max-w-[98%] sm:max-w-[95%] mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 transition-colors duration-300">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div 
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: ABBK_COLORS.red }}
              ></div>
              <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[98%] sm:max-w-[95%] mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <div 
          className="text-white p-4 sm:p-6 rounded-lg mb-6 sm:mb-8 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8"
          style={{ background: `linear-gradient(135deg, ${ABBK_COLORS.red} 0%, ${ABBK_COLORS.darkred} 100%)` }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-center">{t('step5.title')}</h2>
          <p className="text-center text-xs sm:text-sm mt-2 opacity-90">{t('step5.step')}</p>
        </div>

        {/* Client Info Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 transition-colors duration-300">
          <h3 className="text-sm font-bold mb-2 sm:mb-3 text-gray-800 dark:text-white">{t('step5.clientSummary')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('step5.client')}</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.clientName}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('step5.location')}</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.location}</span>
            </div>
            
          </div>
        </div>

        {/* Formations Table */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{t('step5.formationsPlanning')}</h3>
            
            <button
              onClick={addFormationRow}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg hover:shadow-md font-medium transition text-sm sm:text-base"
              style={{ backgroundColor: ABBK_COLORS.red }}
              onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
              onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
            >
              <Plus size={18} />
              {t('step5.addFormation')}
            </button>
          </div>

          {/* Mobile Warning */}
          <div className="lg:hidden bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
              📱 Scroll horizontally to see all columns
            </p>
          </div>

          <div className="overflow-x-auto border-2 border-gray-800 dark:border-gray-600 rounded-lg shadow-lg">
            {/* REDUCED min-w from 1000px to 850px */}
            <table className="w-full text-xs sm:text-sm border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 border-b-2 border-gray-800 dark:border-gray-600">
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[150px]">
                    {t('step5.formation')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[120px]">
                    {t('step5.formateur')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[100px]">
                    {t('step5.nombreJours')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[110px]">
                    {t('step5.dateDebut')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[110px]">
                    {t('step5.dateFin')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-left font-bold text-gray-900 dark:text-white min-w-[100px]">
                    {t('step5.heures')}
                  </th>
                  {/* REMOVED DETAILS HEADER */}
                  <th className="p-2 sm:p-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {planData.formations.map((formation, index) => (
                  <tr key={index} className="border-b-2 border-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                      <select
                        value={formation.formationName}
                        onChange={(e) => updateFormation(index, 'formationName', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300"
                      >
                        <option value="">{t('step5.selectFormation') || 'Select Formation'}</option>
                        {formations.map(f => (
                          <option key={f.id} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                      <select
                        value={formation.formateur}
                        onChange={(e) => updateFormation(index, 'formateur', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300"
                      >
                        <option value="">{t('step5.selectIntervenant') || 'Select Intervenant'}</option>
                        {intervenants.map(int => (
                          <option key={int.id} value={int.name}>{int.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                      <input
                        type="number"
                        min="1"
                        value={formation.nombreJours}
                        onChange={(e) => updateFormation(index, 'nombreJours', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center transition-colors duration-300"
                        placeholder="3"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                      <input
                        type="date"
                        value={formation.dateDebut}
                        onChange={(e) => updateFormation(index, 'dateDebut', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                      <input
                        type="date"
                        value={formation.dateFin}
                        readOnly
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-300"
                        title="Auto-calculated from date début + nombre de jours"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                      <input
                        type="text"
                        value={formation.heuresFormation}
                        onChange={(e) => updateFormation(index, 'heuresFormation', e.target.value)}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center transition-colors duration-300"
                        placeholder="9h - 17h"
                      />
                    </td>
                    {/* REMOVED DETAILS CELL */}
                    <td className="p-2">
                      {planData.formations.length > 1 && (
                        <button
                          onClick={() => removeFormationRow(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                        >
                          <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NEW: Details Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">{t('step5.details')}</h3>
          <textarea
            value={planData.details}
            onChange={(e) => updatePlanData({ details: e.target.value })}
            rows="4"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 text-xs sm:text-sm"
            placeholder={t('step5.detailsPlaceholder') || "Enter common details here..."}
          />
        </div>

        {/* Notes Section */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">{t('step5.note')}</h3>
          <textarea
            value={planData.notes}
            onChange={(e) => updatePlanData({ notes: e.target.value })}
            rows="6"
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 text-xs sm:text-sm"
            placeholder={t('step5.notePlaceholder') || "Enter notes here..."}
          />
        </div>

        {/* Contact Note */}
        <div className="mb-6 sm:mb-8">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t('step5.contactNote')}
          </label>
          <input
            type="text"
            value={planData.contactNote}
            onChange={(e) => updatePlanData({ contactNote: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 text-xs sm:text-sm"
            placeholder="Notre contact à :"
          />
        </div>

        {/* Date and Signatures */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 pt-4 sm:pt-6 border-t-2 border-gray-300 dark:border-gray-600">
          <div>
            <label className="block text-sm font-bold text-gray-800 dark:text-white mb-3">
              {t('step5.dateLe')}
            </label>
            <input
              type="date"
              value={planData.dateSignature}
              onChange={(e) => updatePlanData({ dateSignature: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors duration-300 text-xs sm:text-sm"
            />
            <div className="mt-6 sm:mt-8 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">{t('step5.signature')}</p>
              <div className="h-20 sm:h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700/30"></div>
            </div>
          </div>

          <div>
            <div className="mt-10 sm:mt-14 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">{t('step5.signatureABBK')}</p>
              <div className="h-20 sm:h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}