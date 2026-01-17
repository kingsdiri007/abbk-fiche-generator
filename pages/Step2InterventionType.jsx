// This is a large file - Part 1: Main structure with responsive layout
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, SkipForward, Lock } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { getAllFormations, saveCustomFormation, checkIfAdmin, getAllIntervenants } from '../services/supabaseService';
import LicenseTable from '../components/LicenseTable';
import { ABBK_COLORS } from '../utils/theme';
import { translateFormation } from '../services/translationService';
import { useLanguage } from '../context/LanguageContext';

export default function Step2InterventionType() {
  const { t, language } = useLanguage();
  const { formData, updateFormData, showToast } = useFormContext();
  const [formations, setFormations] = useState([]);
  const [intervenants, setIntervenants] = useState([]);
  const [activeFormation, setActiveFormation] = useState(null);
  const [softwareFilter, setSoftwareFilter] = useState('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFormationList, setShowFormationList] = useState(true); // For mobile toggle

  useEffect(() => {
    loadFormations();
    loadIntervenants();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (softwareFilter !== 'all') {
      loadFormations(softwareFilter);
    } else {
      loadFormations();
    }
  }, [softwareFilter]);


const loadFormations = async (software = null) => {
  try {
    setLoading(true);
    const data = await getAllFormations(software);
    
    // Translate formations if not in French (database default)
    if (language === 'en') {
      const translatedData = await Promise.all(
        data.map(formation => translateFormation(formation, 'en'))
      );
      setFormations(translatedData);
    } else {
      setFormations(data);
    }
  } catch (error) {
    console.error('Error loading formations:', error);
    showToast?.(t('error.loadingFormations') || 'Error loading formations: ' + error.message, 'error');
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (!loading && formations.length > 0) {
    loadFormations(softwareFilter === 'all' ? null : softwareFilter);
  }
}, [language]);
  const loadIntervenants = async () => {
    try {
      const data = await getAllIntervenants();
      setIntervenants(data);
    } catch (error) {
      console.error('Error loading intervenants:', error);
      showToast?.('Error loading intervenants: ' + error.message, 'error');
    }
  };

  const checkAdminStatus = async () => {
    try {
      const admin = await checkIfAdmin();
      setIsAdmin(admin);
    } catch (error) {
      console.error('Error checking admin:', error);
    }
  };

  const softwareList = ['all', ...new Set(formations.map(f => f.software))];

  const convertFormationToFormData = (formation) => {
    return {
      formationName: formation.name,
      formationRef: formation.formation_ref,
      prerequisites: formation.prerequisites,
      objectives: formation.objectives,
      competencies: formation.competencies,
      schedule: formation.schedule || []
    };
  };

  const toggleFormation = (formation) => {
    const selected = formData.selectedFormations || [];
    const isSelected = selected.some(id => id === formation.formation_id);

    if (isSelected) {
      if (hasUnsavedChanges && activeFormation === formation.formation_id) {
        if (!window.confirm(t('step2.unsavedWarning') || 'You have unsaved changes. Continue without saving?')) {
          return;
        }
      }

      const newSelected = selected.filter(id => id !== formation.formation_id);
      const newData = { ...formData.formationsData };
      delete newData[formation.formation_id];
      
      updateFormData({
        selectedFormations: newSelected,
        formationsData: newData
      });
      
      if (activeFormation === formation.formation_id) {
        setActiveFormation(newSelected[0] || null);
      }
      setHasUnsavedChanges(false);
    } else {
      const newSelected = [...selected, formation.formation_id];
      const formationData = convertFormationToFormData(formation);
      const newData = {
        ...formData.formationsData,
        [formation.formation_id]: formationData
      };
      
      updateFormData({
        selectedFormations: newSelected,
        formationsData: newData
      });
      
      setActiveFormation(formation.formation_id);
      setHasUnsavedChanges(false);
      // On mobile, automatically switch to details view
      if (window.innerWidth < 1024) {
        setShowFormationList(false);
      }
    }
  };

  const updateFormationData = (formationId, field, value) => {
    const newData = {
      ...formData.formationsData,
      [formationId]: {
        ...formData.formationsData[formationId],
        [field]: value
      }
    };
    updateFormData({ formationsData: newData });
    setHasUnsavedChanges(true);
  };

  const addScheduleDay = () => {
    if (!activeFormation) return;
    const formationData = formData.formationsData[activeFormation];
    const newSchedule = [
      ...(formationData.schedule || []),
      { 
        day: `J${(formationData.schedule || []).length + 1}`, 
        content: '', 
        methods: '', 
        theoryHours: '', 
        practiceHours: '',
        intervenant: ''
      }
    ];
    updateFormationData(activeFormation, 'schedule', newSchedule);
  };

  const removeScheduleDay = (index) => {
    if (!activeFormation) return;
    const formationData = formData.formationsData[activeFormation];
    const newSchedule = (formationData.schedule || []).filter((_, i) => i !== index);
    updateFormationData(activeFormation, 'schedule', newSchedule);
  };

  const updateScheduleDay = (index, field, value) => {
    if (!activeFormation) return;
    const formationData = formData.formationsData[activeFormation];
    const newSchedule = [...(formationData.schedule || [])];
    newSchedule[index][field] = value;
    updateFormationData(activeFormation, 'schedule', newSchedule);
  };

  const handleSaveAsNew = async () => {
    if (!activeFormation) return;

    try {
      const formationData = formData.formationsData[activeFormation];
      
      const savedFormation = await saveCustomFormation(activeFormation, {
        name: formationData.formationName,
        formation_ref: formationData.formationRef,
        software: formations.find(f => f.formation_id === activeFormation)?.software || 'Custom',
        prerequisites: formationData.prerequisites,
        objectives: formationData.objectives,
        competencies: formationData.competencies,
        schedule: formationData.schedule
      });

      await loadFormations(softwareFilter === 'all' ? null : softwareFilter);

      const newFormationId = savedFormation.formation_id;
      const newData = {
        ...formData.formationsData,
        [newFormationId]: formationData
      };
      const newSelected = [...(formData.selectedFormations || []), newFormationId];

      updateFormData({
        formationsData: newData,
        selectedFormations: newSelected
      });

      setActiveFormation(newFormationId);
      setHasUnsavedChanges(false);
      setShowSaveModal(false);
      showToast?.(t('step2.formationSaved'), 'success');
    } catch (error) {
      console.error('Error saving formation:', error);
      showToast?.(t('error.savingFormation') || 'Error saving formation: ' + error.message, 'error');
    }
  };

  const handleSkipSave = () => {
    setHasUnsavedChanges(false);
    setShowSaveModal(false);
    showToast?.(t('step2.changesDiscarded'), 'info');
  };

  const activeFormationData = activeFormation ? formData.formationsData[activeFormation] : null;
  const activeFormationObj = activeFormation ? formations.find(f => f.formation_id === activeFormation) : null;
  const isCustomFormation = activeFormationObj?.is_custom;
  const filteredFormations = formations;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: ABBK_COLORS.red }}
        ></div>
      </div>
    );
  }

  // Continue in next artifact for the JSX return...

  return (
 
<div className="space-y-6"> {/* License Mode - Already responsive with LicenseTable */}
  {formData.interventionType === 'license' && (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">{t('step2.licenseInfo')}</h3>
      <LicenseTable />
    </div>
  )}

  {/* Formation Mode */}
  {formData.interventionType === 'formation' && (
    <>
      {/* Mobile: Show/Hide Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowFormationList(!showFormationList)}
          className="w-full px-4 py-3 text-white rounded-lg font-medium"
          style={{ backgroundColor: ABBK_COLORS.red }}
        >
          {showFormationList ? 'View Selected Details' : 'Back to Formation List'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* Formation List - Hidden on mobile when viewing details */}
        <div className={`lg:col-span-3 ${showFormationList ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-4">
            <h3 className="text-base sm:text-lg font-bold mb-4">{t('step2.formations')}</h3>
            
            {/* Software Filter */}
            <select
              value={softwareFilter}
              onChange={(e) => setSoftwareFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg mb-4"
            >
              {softwareList.map(software => (
                <option key={software} value={software}>
                  {software === 'all' ? t('step2.allSoftware') : software}
                </option>
              ))}
            </select>

            {/* Formation List - Make scrollable */}
            <div className="space-y-2 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {filteredFormations.map((formation) => {
                const isSelected = (formData.selectedFormations || []).includes(formation.formation_id);
                return (
                  <button
                    key={formation.id}
                    onClick={() => toggleFormation(formation)}
                    className={`w-full p-3 rounded-lg text-left transition-all text-sm ${
                      isSelected && activeFormation === formation.formation_id
                        ? 'text-white shadow-md'
                        : isSelected 
                        ? 'border-2'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={isSelected && activeFormation === formation.formation_id ? {
                      backgroundColor: ABBK_COLORS.red
                    } : isSelected ? {
                      borderColor: ABBK_COLORS.red,
                      backgroundColor: `${ABBK_COLORS.red}20`
                    } : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{formation.name}</span>
                      {isSelected && <span className="font-bold ml-2">✓</span>}
                    </div>
                    <div className="text-xs opacity-75 mt-1 truncate">{formation.formation_ref}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Formation Details - Show on mobile when formation selected */}
        <div className={`lg:col-span-9 ${!showFormationList ? 'block' : 'hidden lg:block'}`}>
          {activeFormation && activeFormationData ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 max-h-[700px] overflow-y-auto">
              {/* Header */}
              <div 
                className="text-white p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8"
                style={{ backgroundColor: ABBK_COLORS.red }}
              >
                <h3 className="text-lg sm:text-xl font-bold">{activeFormationObj?.name}</h3>
                <p className="text-xs sm:text-sm opacity-90 mt-1">
                  {isCustomFormation ? t('step2.editAllFields') : t('step2.templateModify')}
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Info - Stack on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('step2.formationName')} *
                    </label>
                    <input
                      type="text"
                      value={activeFormationData.formationName}
                      onChange={(e) => updateFormationData(activeFormation, 'formationName', e.target.value)}
                      disabled={!isAdmin && !isCustomFormation}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t('step2.reference')} *
                    </label>
                    <input
                      type="text"
                      value={activeFormationData.formationRef}
                      onChange={(e) => updateFormationData(activeFormation, 'formationRef', e.target.value)}
                      disabled={!isAdmin && !isCustomFormation}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                    />
                  </div>
                </div>
{/* Textareas */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('step2.prerequisites')}
                  </label>
                  <textarea
                    value={activeFormationData.prerequisites}
                    onChange={(e) => updateFormationData(activeFormation, 'prerequisites', e.target.value)}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('step2.objectives')}
                  </label>
                  <textarea
                    value={activeFormationData.objectives}
                    onChange={(e) => updateFormationData(activeFormation, 'objectives', e.target.value)}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('step2.competencies')}
                  </label>
                  <textarea
                    value={activeFormationData.competencies}
                    onChange={(e) => updateFormationData(activeFormation, 'competencies', e.target.value)}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-sm sm:text-base"
                  />
                </div>

                {/* Schedule Table - IMPORTANT: Horizontal scroll on mobile */}
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                    <label className="text-sm font-medium">{t('step2.schedule')}</label>
                    <button
                      onClick={addScheduleDay}
                      className="flex items-center gap-2 px-3 py-2 text-white rounded-lg text-xs sm:text-sm"
                      style={{ backgroundColor: ABBK_COLORS.red }}
                    >
                      <Plus size={14} />
                      {t('step2.addDay')}
                    </button>
                  </div>

                  {/* Mobile hint */}
                  <p className="text-xs text-gray-500 mb-2 sm:hidden">
                    ℹ️ Scroll horizontally to view all columns
                  </p>

                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-xs min-w-[800px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold w-12">
                            {t('step4.days')}
                          </th>
                          <th className="px-2 py-2 text-left font-semibold">
                            {t('step4.content')}
                          </th>
                          <th className="px-2 py-2 text-left font-semibold">
                            {t('step4.methods')}
                          </th>
                          <th className="px-2 py-2 text-center font-semibold w-16">
                            {t('step4.theory')}
                          </th>
                          <th className="px-2 py-2 text-center font-semibold w-16">
                            {t('step4.practice')}
                          </th>
                          <th className="px-2 py-2 text-left font-semibold w-32">
                            Intervenant
                          </th>
                          <th className="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(activeFormationData.schedule || []).map((day, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={day.day}
                                onChange={(e) => updateScheduleDay(index, 'day', e.target.value)}
                                className="w-full px-1 py-1 text-xs border rounded text-center"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <textarea
                                value={day.content}
                                onChange={(e) => updateScheduleDay(index, 'content', e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded"
                                rows="2"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <textarea
                                value={day.methods}
                                onChange={(e) => updateScheduleDay(index, 'methods', e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded"
                                rows="2"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={day.theoryHours}
                                onChange={(e) => updateScheduleDay(index, 'theoryHours', e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded text-center"
                                placeholder="6h"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={day.practiceHours}
                                onChange={(e) => updateScheduleDay(index, 'practiceHours', e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded text-center"
                                placeholder="0h"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <select
                                value={day.intervenant || ''}
                                onChange={(e) => updateScheduleDay(index, 'intervenant', e.target.value)}
                                className="w-full px-2 py-1 text-xs border rounded"
                              >
                                <option value="">-- Select --</option>
                                {intervenants.map((int) => (
                                  <option key={int.id} value={int.name}>{int.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              {(activeFormationData.schedule || []).length > 1 && (
                                <button
                                  onClick={() => removeScheduleDay(index)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12 text-center">
              <p className="text-lg sm:text-xl text-gray-400 mb-2">
                {t('step2.selectToView')}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {t('step2.fieldsPreFilled')}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )}
</div>
  );
}