import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, SkipForward, Lock } from 'lucide-react';
import { useFormContext } from '../context/FormContext';
import { getAllFormations, saveCustomFormation, checkIfAdmin } from '../services/supabaseService';
import LicenseTable from '../components/LicenseTable';
import { ABBK_COLORS } from '../utils/theme';

export default function Step2InterventionType() {
  const { formData, updateFormData, showToast } = useFormContext();
  const [formations, setFormations] = useState([]);
  const [activeFormation, setActiveFormation] = useState(null);
  const [softwareFilter, setSoftwareFilter] = useState('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormations();
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
      setFormations(data);
    } catch (error) {
      console.error('Error loading formations:', error);
      showToast?.('Error loading formations: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
        if (!window.confirm('You have unsaved changes. Continue without saving?')) {
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
      { day: `J${(formationData.schedule || []).length + 1}`, content: '', methods: '', theoryHours: '', practiceHours: '' }
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
      showToast?.('Formation saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving formation:', error);
      showToast?.('Error saving formation: ' + error.message, 'error');
    }
  };

  const handleSkipSave = () => {
    setHasUnsavedChanges(false);
    setShowSaveModal(false);
    showToast?.('Changes discarded', 'info');
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

  return (
    <div className="space-y-6">
      {/* Intervention Type Selection */}
      <div className="grid grid-cols-2 gap-6">
        <button
          onClick={() => updateFormData({ interventionType: 'formation' })}
          className={`p-8 rounded-xl text-center transition-all shadow ${
            formData.interventionType === 'formation'
              ? 'text-white scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          style={formData.interventionType === 'formation' ? { 
            backgroundColor: ABBK_COLORS.red,
            boxShadow: `0 10px 15px -3px ${ABBK_COLORS.red}40`
          } : {}}
        >
          <span className="text-3xl mb-2 block">📚</span>
          <span className="text-2xl font-semibold">Formation</span>
        </button>

        <button
          onClick={() => updateFormData({ interventionType: 'license' })}
          className={`p-8 rounded-xl text-center transition-all shadow ${
            formData.interventionType === 'license'
              ? 'text-white scale-105'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          style={formData.interventionType === 'license' ? { 
            backgroundColor: ABBK_COLORS.darkred,
            boxShadow: `0 10px 15px -3px ${ABBK_COLORS.darkred}40`
          } : {}}
        >
          <span className="text-3xl mb-2 block">🔧</span>
          <span className="text-2xl font-semibold">License</span>
        </button>
      </div>

      {/* License Mode */}
      {formData.interventionType === 'license' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">License Information</h3>
          <LicenseTable />
        </div>
      )}

      {/* Formation Mode */}
      {formData.interventionType === 'formation' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Formation List */}
          <div className="col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sticky top-4 transition-colors duration-300">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Formations</h3>
              
              {/* Software Filter */}
              <select
                value={softwareFilter}
                onChange={(e) => setSoftwareFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm mb-4 transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {softwareList.map(software => (
                  <option key={software} value={software}>
                    {software === 'all' ? 'All Software' : software}
                  </option>
                ))}
              </select>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Select one or more formations</p>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFormations.map((formation) => {
                  const isSelected = (formData.selectedFormations || []).includes(formation.formation_id);
                  return (
                    <button
                      key={formation.id}
                      onClick={() => toggleFormation(formation)}
                      className={`w-full p-3 rounded-lg text-left transition-all text-sm ${
                        isSelected
                          ? activeFormation === formation.formation_id
                            ? 'text-white shadow-md'
                            : 'border-2 text-gray-700 dark:text-gray-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      style={isSelected && activeFormation === formation.formation_id ? {
                        backgroundColor: ABBK_COLORS.red,
                        borderColor: ABBK_COLORS.red
                      } : isSelected ? {
                        borderColor: ABBK_COLORS.red,
                        backgroundColor: `${ABBK_COLORS.red}20`
                      } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{formation.name}</span>
                        {isSelected && <span className="font-bold">✓</span>}
                      </div>
                      <div className="text-xs opacity-75 mt-1">{formation.formation_ref}</div>
                      <div className="text-xs opacity-60 mt-1">{formation.software}</div>
                      {formation.is_custom && (
                        <div 
                          className="text-xs text-white px-2 py-1 rounded mt-2 inline-block"
                          style={{ backgroundColor: ABBK_COLORS.darkred }}
                        >
                          Custom
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {(formData.selectedFormations || []).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {(formData.selectedFormations || []).length} formation(s) selected
                  </p>
                  {hasUnsavedChanges && (
                    <p className="text-xs mt-1" style={{ color: ABBK_COLORS.red }}>
                      ⚠️ Unsaved changes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Formation Details */}
          <div className="col-span-9">
            {activeFormation && activeFormationData ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-h-[700px] overflow-y-auto transition-colors duration-300">
                <div 
                  className="text-white p-4 rounded-lg mb-6 -mx-8 -mt-8 flex items-center justify-between"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                >
                  <div>
                    <h3 className="text-xl font-bold">{activeFormationObj?.name || 'Formation'}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      {isCustomFormation ? 'Custom formation - All fields editable' : 'Template - You can modify and save as new'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {hasUnsavedChanges && (
                      <button
                        onClick={() => setShowSaveModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition"
                        style={{ color: ABBK_COLORS.red }}
                      >
                        <Save size={18} />
                        Save
                      </button>
                    )}
                    <Edit2 size={24} className="opacity-75" />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom de formation: *
                        {!isAdmin && !isCustomFormation && <Lock size={14} className="inline ml-1 text-gray-400" />}
                      </label>
                      <input
                        type="text"
                        value={activeFormationData.formationName}
                        onChange={(e) => updateFormationData(activeFormation, 'formationName', e.target.value)}
                        disabled={!isAdmin && !isCustomFormation}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          !isAdmin && !isCustomFormation ? 'cursor-not-allowed opacity-60' : ''
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Référence: *
                        {!isAdmin && !isCustomFormation && <Lock size={14} className="inline ml-1 text-gray-400" />}
                      </label>
                      <input
                        type="text"
                        value={activeFormationData.formationRef}
                        onChange={(e) => updateFormationData(activeFormation, 'formationRef', e.target.value)}
                        disabled={!isAdmin && !isCustomFormation}
                        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          !isAdmin && !isCustomFormation ? 'cursor-not-allowed opacity-60' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prérequis:
                    </label>
                    <textarea
                      value={activeFormationData.prerequisites}
                      onChange={(e) => updateFormationData(activeFormation, 'prerequisites', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Objectifs visés:
                    </label>
                    <textarea
                      value={activeFormationData.objectives}
                      onChange={(e) => updateFormationData(activeFormation, 'objectives', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compétences acquises:
                    </label>
                    <textarea
                      value={activeFormationData.competencies}
                      onChange={(e) => updateFormationData(activeFormation, 'competencies', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Schedule Table */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Programme de Formation:
                      </label>
                      <button
                        onClick={addScheduleDay}
                        className="flex items-center gap-2 px-3 py-1.5 text-white rounded-lg text-xs hover:shadow-md transition"
                        style={{ backgroundColor: ABBK_COLORS.red }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                        onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
                      >
                        <Plus size={14} />
                        Add Day
                      </button>
                    </div>

                    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>
                            <th className="px-2 py-2 text-left font-semibold w-12 text-gray-900 dark:text-white">Jours</th>
                            <th className="px-2 py-2 text-left font-semibold text-gray-900 dark:text-white">Contenu / Concepts</th>
                            <th className="px-2 py-2 text-left font-semibold text-gray-900 dark:text-white">Méthodes</th>
                            <th className="px-2 py-2 text-center font-semibold w-16 text-gray-900 dark:text-white">Théorie</th>
                            <th className="px-2 py-2 text-center font-semibold w-16 text-gray-900 dark:text-white">Pratique</th>
                            <th className="px-2 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(activeFormationData.schedule || []).map((day, index) => (
                            <tr key={index} className="border-t border-gray-300 dark:border-gray-600">
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={day.day}
                                  onChange={(e) => updateScheduleDay(index, 'day', e.target.value)}
                                  className="w-full px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <textarea
                                  value={day.content}
                                  onChange={(e) => updateScheduleDay(index, 'content', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
                                  rows="3"
                                  placeholder="Content"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <textarea
                                  value={day.methods}
                                  onChange={(e) => updateScheduleDay(index, 'methods', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
                                  rows="3"
                                  placeholder="Methods"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={day.theoryHours}
                                  onChange={(e) => updateScheduleDay(index, 'theoryHours', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                                  placeholder="6h"
                                />
                              </td>
                              <td className="px-2 py-2">
                                <input
                                  type="text"
                                  value={day.practiceHours}
                                  onChange={(e) => updateScheduleDay(index, 'practiceHours', e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                                  placeholder="0h"
                                />
                              </td>
                              <td className="px-2 py-2">
                                {(activeFormationData.schedule || []).length > 1 && (
                                  <button
                                    onClick={() => removeScheduleDay(index)}
                                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
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

                    {/* Total Hours */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mt-3 transition-colors duration-300">
                      <div className="flex justify-between text-xs">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">Théorie: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {(activeFormationData.schedule || []).reduce((sum, day) => {
                              const hours = day.theoryHours === '-' ? 0 : (parseFloat(day.theoryHours) || 0);
                              return sum + hours;
                            }, 0)}h
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">Pratique: </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {(activeFormationData.schedule || []).reduce((sum, day) => {
                              const hours = day.practiceHours === '-' ? 0 : (parseFloat(day.practiceHours) || 0);
                              return sum + hours;
                            }, 0)}h
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">Total: </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {(activeFormationData.schedule || []).reduce((sum, day) => {
                              const theory = day.theoryHours === '-' ? 0 : (parseFloat(day.theoryHours) || 0);
                              const practice = day.practiceHours === '-' ? 0 : (parseFloat(day.practiceHours) || 0);
                              return sum + theory + practice;
                            }, 0)}h
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors duration-300">
                <p className="text-xl text-gray-400 dark:text-gray-500 mb-2">Select a formation to view and edit details</p>
                <p className="text-sm text-gray-500 dark:text-gray-600">All fields are pre-filled but can be modified</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!formData.interventionType && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors duration-300">
          <p className="text-xl text-gray-400 dark:text-gray-500">Select intervention type</p>
          <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">Formation or License</p>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Save Formation Changes?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have modified this formation. What would you like to do?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSaveAsNew}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white rounded-lg font-medium transition shadow-md"
                style={{ backgroundColor: ABBK_COLORS.red }}
                onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
              >
                <Save size={20} />
                Save as New Formation
              </button>

              <button
                onClick={handleSkipSave}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium transition"
              >
                <SkipForward size={20} />
                Use Without Saving
              </button>

              <button
                onClick={() => setShowSaveModal(false)}
                className="w-full px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              * Saving creates a new custom formation with your modifications
            </p>
          </div>
        </div>
      )}
    </div>
  );
}