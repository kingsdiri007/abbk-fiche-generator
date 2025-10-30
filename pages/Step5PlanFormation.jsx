import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { Plus, Trash2 } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';

export default function Step5PlanFormation() {
  const { formData, updateFormData } = useFormContext();

  // Auto-fill from formation data on first load - FIXED to fill ALL formations
  useEffect(() => {
    if (!formData.planData && formData.selectedFormations && formData.selectedFormations.length > 0) {
      const autoFilledFormations = formData.selectedFormations.map(formationId => {
        const formationData = formData.formationsData[formationId] || {};
        
        // Calculate total days and hours from schedule
        const schedule = formationData.schedule || [];
        const nombreJours = schedule.length || '';
        const totalTheory = schedule.reduce((sum, day) => sum + (parseFloat(day.theoryHours) || 0), 0);
        const totalPractice = schedule.reduce((sum, day) => sum + (parseFloat(day.practiceHours) || 0), 0);
        const totalHours = totalTheory + totalPractice;
        const dureeFormation = totalHours ? `${totalHours}h` : '';

        return {
          formationName: formationData.formationName || '',
          formateur: formData.intervenant || '', // Auto-fill formateur for ALL
          nombreJours: nombreJours.toString(),
          dureeFormation: dureeFormation,
          lieuFormation: formData.location || '', // Auto-fill lieu for ALL
          dateDebut: formData.interventionDate || '',
          dateFin: '',
          heuresFormation: '9h - 17h',
          details: ''
        };
      });

      updateFormData({
        planData: {
          formations: autoFilledFormations,
          notes: 'Le planning est fixé, aucun changement à prévoir.\nToutes les dates sont fixées en fonction de la disponibilité de :\nLa fiche de présence est obligatoire et doit être signée par le formateur ainsi que par . N\'oubliez pas de prendre des photos, après avoir obtenu les autorisations nécessaires.',
          contactNote: 'Notre contact à :',
          dateSignature: formData.interventionDate || ''
        }
      });
    }
  }, []);

  const planData = formData.planData || {
    formations: [{
      formationName: '',
      formateur: '',
      nombreJours: '',
      dureeFormation: '',
      lieuFormation: '',
      dateDebut: '',
      dateFin: '',
      heuresFormation: '9h - 17h',
      details: ''
    }],
    notes: 'Le planning est fixé, aucun changement à prévoir.\nToutes les dates sont fixées en fonction de la disponibilité de :\nLa fiche de présence est obligatoire et doit être signée par le formateur ainsi que par . N\'oubliez pas de prendre des photos, après avoir obtenu les autorisations nécessaires.',
    contactNote: 'Notre contact à :',
    dateSignature: ''
  };

  const updatePlanData = (updates) => {
    updateFormData({
      planData: {
        ...planData,
        ...updates
      }
    });
  };

  const addFormationRow = () => {
    updatePlanData({
      formations: [
        ...planData.formations,
        {
          formationName: '',
          formateur: formData.intervenant || '',
          nombreJours: '',
          dureeFormation: '',
          lieuFormation: formData.location || '',
          dateDebut: '',
          dateFin: '',
          heuresFormation: '9h - 17h',
          details: ''
        }
      ]
    });
  };

  const removeFormationRow = (index) => {
    if (planData.formations.length > 1) {
      const newFormations = planData.formations.filter((_, i) => i !== index);
      updatePlanData({ formations: newFormations });
    }
  };

  const updateFormation = (index, field, value) => {
    const newFormations = [...planData.formations];
    newFormations[index][field] = value;
    updatePlanData({ formations: newFormations });
  };

  return (
    <div className="max-w-[95%] mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <div 
          className="text-white p-6 rounded-lg mb-8 -mx-8 -mt-8"
          style={{ background: `linear-gradient(135deg, ${ABBK_COLORS.red} 0%, ${ABBK_COLORS.darkred} 100%)` }}
        >
          <h2 className="text-2xl font-bold text-center">FICHE PLAN DE FORMATION</h2>
          <p className="text-center text-sm mt-2 opacity-90">Step 5 of 7</p>
        </div>

        {/* Client Info Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6 transition-colors duration-300">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Client:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.clientName}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Location:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.location}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Intervenant:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{formData.intervenant}</span>
            </div>
          </div>
        </div>

        {/* Formations Table - WIDER COLUMNS */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Formations Planning</h3>
            
            <button
              onClick={addFormationRow}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-md font-medium transition"
              style={{ backgroundColor: ABBK_COLORS.red }}
              onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
              onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
            >
              <Plus size={18} />
              Add Formation
            </button>
          </div>

          <div className="overflow-x-auto border-2 border-gray-800 dark:border-gray-600 rounded-lg shadow-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 border-b-2 border-gray-800 dark:border-gray-600">
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[200px] text-gray-900 dark:text-white">
                    Formation
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[150px] text-gray-900 dark:text-white">
                    Formateur
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[120px] text-gray-900 dark:text-white">
                    Nombre de jours
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[120px] text-gray-900 dark:text-white">
                    Durée
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[150px] text-gray-900 dark:text-white">
                    Lieu
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[140px] text-gray-900 dark:text-white">
                    Date début
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[140px] text-gray-900 dark:text-white">
                    Date fin
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[120px] text-gray-900 dark:text-white">
                    Heures
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-4 text-left font-bold min-w-[180px] text-gray-900 dark:text-white">
                    Détails
                  </th>
                  <th className="p-4 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {planData.formations.map((formation, index) => (
                  <tr key={index} className="border-b-2 border-gray-800 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.formationName}
                        onChange={(e) => updateFormation(index, 'formationName', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                        placeholder="Formation name"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.formateur}
                        onChange={(e) => updateFormation(index, 'formateur', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                        placeholder="Formateur"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.nombreJours}
                        onChange={(e) => updateFormation(index, 'nombreJours', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center transition-colors duration-300"
                        placeholder="3"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.dureeFormation}
                        onChange={(e) => updateFormation(index, 'dureeFormation', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center transition-colors duration-300"
                        placeholder="24h"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.lieuFormation}
                        onChange={(e) => updateFormation(index, 'lieuFormation', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                        placeholder="Location"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="date"
                        value={formation.dateDebut}
                        onChange={(e) => updateFormation(index, 'dateDebut', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="date"
                        value={formation.dateFin}
                        onChange={(e) => updateFormation(index, 'dateFin', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.heuresFormation}
                        onChange={(e) => updateFormation(index, 'heuresFormation', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center transition-colors duration-300"
                        placeholder="9h - 17h"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={formation.details}
                        onChange={(e) => updateFormation(index, 'details', e.target.value)}
                        className="w-full px-3 py-3 text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                        placeholder="Contact details"
                      />
                    </td>
                    <td className="p-3">
                      {planData.formations.length > 1 && (
                        <button
                          onClick={() => removeFormationRow(index)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Note :</h3>
          <textarea
            value={planData.notes || ''}
            onChange={(e) => updatePlanData({ notes: e.target.value })}
            rows="6"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 transition-colors duration-300"
            placeholder="Enter notes here..."
          />
        </div>

        {/* Contact Note */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Contact Note:
          </label>
          <input
            type="text"
            value={planData.contactNote}
            onChange={(e) => updatePlanData({ contactNote: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 transition-colors duration-300"
            placeholder="Notre contact à :"
          />
        </div>

        {/* Date and Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-gray-300 dark:border-gray-600">
          <div>
            <label className="block text-sm font-bold text-gray-800 dark:text-white mb-3">
              Date Le :
            </label>
            <input
              type="date"
              value={planData.dateSignature}
              onChange={(e) => updatePlanData({ dateSignature: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 transition-colors duration-300"
            />
            <div className="mt-8 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">Signature</p>
              <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700/30"></div>
            </div>
          </div>

          <div>
            <div className="mt-14 pt-4 border-t-2 border-gray-300 dark:border-gray-600">
              <p className="text-sm font-bold text-gray-800 dark:text-white mb-3">Signature ABBK PHYSICSWORKS</p>
              <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-700/30"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}