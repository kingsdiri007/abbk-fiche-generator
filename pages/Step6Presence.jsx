// Step6Presence.jsx
import React, { useEffect, useState } from 'react';
import { useFormContext } from '../context/FormContext';
import { Plus, Trash2, X, Search } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';
import { getAllStudents, searchStudents, addStudent } from '../services/supabaseService';

export default function Step6Presence() {
  const { t } = useLanguage();
  const { formData, updateFormData } = useFormContext();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: '',
    etablissement: ''
  });

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students based on search
  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      setFilteredStudents(students);
    }
  }, [searchTerm, students]);

  // Auto-fill from previous data
  useEffect(() => {
    if (!formData.presenceData) {
      const planFormation = formData.planData?.formations?.[0] || {};
      const nombreJours = Math.min(parseInt(planFormation.nombreJours || '2'), 7);
      
      updateFormData({
        presenceData: {
          entreprise: formData.clientName || '',
          themeFormation: planFormation.formationName || '',
          periodeDebut: planFormation.dateDebut || '',
          periodeFin: planFormation.dateFin || '',
          cadreFormation: '',
          formateur: planFormation.formateur || formData.intervenant || '',
          nombreJours: nombreJours.toString(),
          dureeFormation: planFormation.dureeFormation || '',
          modeFormation: 'Présentielle',
          lieuFormation: planFormation.lieuFormation || formData.location || '',
          heureDebut: '9h',
          heureFin: '17h',
          participants: [
            { 
              nom: '', 
              etablissement: '', 
              jours: Array(nombreJours).fill(''), 
              details: '',
              studentId: null
            }
          ],
          formateurSignature: '',
          notes: "* La fiche de présence doit être soigneusement complétée par ....... ABBK et le formateur. Deux copies sont nécessaires : une pour .... et une pour ABBK.\n* Une fiche de présence sur la plateforme ABBK L'inscription doit également être remplie.",
          dateLe: planFormation.dateDebut || formData.interventionDate || ''
        }
      });
    }
  }, [formData.planData, formData.clientName, formData.intervenant, formData.location, formData.interventionDate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Error loading students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await searchStudents(searchTerm);
      setFilteredStudents(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.etablissement) {
      alert('Please fill in Name and Établissement');
      return;
    }

    try {
      const addedStudent = await addStudent(newStudent);
      await loadStudents();
      
      setNewStudent({ name: '', etablissement: '' });
      setShowAddStudent(false);
      alert('✓ Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student: ' + error.message);
    }
  };

  const handleStudentSelect = (participantIndex, studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const newParticipants = [...presenceData.participants];
      newParticipants[participantIndex] = {
        ...newParticipants[participantIndex],
        nom: student.name,
        etablissement: student.etablissement,
        studentId: student.id
      };
      updatePresenceData({ participants: newParticipants });
    }
  };

  const presenceData = formData.presenceData || {
    entreprise: '',
    themeFormation: '',
    periodeDebut: '',
    periodeFin: '',
    cadreFormation: '',
    formateur: '',
    nombreJours: '2',
    dureeFormation: '',
    modeFormation: 'Présentielle',
    lieuFormation: '',
    heureDebut: '9h',
    heureFin: '17h',
    participants: [
      { nom: '', etablissement: '', jours: ['', ''], details: '', studentId: null }
    ],
    formateurSignature: '',
    notes: '',
    dateLe: ''
  };

  const updatePresenceData = (updates) => {
    updateFormData({
      presenceData: {
        ...presenceData,
        ...updates
      }
    });
  };

  const handleNombreJoursChange = (newNombreJours) => {
    const numDays = Math.min(Math.max(parseInt(newNombreJours) || 2, 1), 7);
    const updatedParticipants = presenceData.participants.map(p => ({
      ...p,
      jours: Array(numDays).fill('').map((_, i) => p.jours[i] || '')
    }));
    
    updatePresenceData({
      nombreJours: numDays.toString(),
      participants: updatedParticipants
    });
  };

  const addParticipant = () => {
    const nombreJours = parseInt(presenceData.nombreJours) || 2;
    updatePresenceData({
      participants: [
        ...presenceData.participants,
        { nom: '', etablissement: '', jours: Array(nombreJours).fill(''), details: '', studentId: null }
      ]
    });
  };

  const removeParticipant = (index) => {
    if (presenceData.participants.length > 1) {
      const newParticipants = presenceData.participants.filter((_, i) => i !== index);
      updatePresenceData({ participants: newParticipants });
    }
  };

  const updateParticipant = (index, field, value) => {
    const newParticipants = [...presenceData.participants];
    newParticipants[index][field] = value;
    updatePresenceData({ participants: newParticipants });
  };

  const updateParticipantJour = (pIndex, jIndex, value) => {
    const newParticipants = [...presenceData.participants];
    newParticipants[pIndex].jours[jIndex] = value;
    updatePresenceData({ participants: newParticipants });
  };

  const toggleParticipantJour = (pIndex, jIndex) => {
    const newParticipants = [...presenceData.participants];
    const currentValue = newParticipants[pIndex].jours[jIndex];
    // Toggle between '✓' and empty string
    newParticipants[pIndex].jours[jIndex] = currentValue === '✓' ? '' : '✓';
    updatePresenceData({ participants: newParticipants });
  };

  const getDates = () => {
    const nombreJours = parseInt(presenceData.nombreJours) || 2;
    const dates = [];
    if (presenceData.periodeDebut) {
      const startDate = new Date(presenceData.periodeDebut);
      for (let i = 0; i < nombreJours; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        // Format date as DD/MM/YYYY
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        dates.push(`${day}/${month}/${year}`);
      }
    }
    return dates;
  };

  const dates = getDates();
  const nombreJours = parseInt(presenceData.nombreJours) || 2;

  if (loading) {
    return (
      <div className="max-w-[95%] mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex items-center justify-center transition-colors duration-300" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ABBK_COLORS.red }}></div>
            <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <div 
          className="text-white p-6 rounded-lg mb-8 -mx-8 -mt-8"
          style={{ backgroundColor: ABBK_COLORS.red }}
        >
          <h2 className="text-3xl font-bold text-center">{t('step6.title')}</h2>
          <p className="text-center text-sm mt-2 opacity-90">{t('step6.step')}</p>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 border-2 border-gray-800 dark:border-gray-600">
          <div>
            <label className="text-sm font-bold text-gray-900 dark:text-white">{t('step6.entreprise')}</label>
            <input
              type="text"
              value={presenceData.entreprise}
              onChange={(e) => updatePresenceData({ entreprise: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg mt-1 transition-colors duration-300"
              style={{ focusRingColor: ABBK_COLORS.red }}
            />
          </div>
        </div>

        {/* Formation Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm border-2 border-gray-800 dark:border-gray-600 p-4">
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.theme')}</label>
            <input
              type="text"
              value={presenceData.themeFormation}
              onChange={(e) => updatePresenceData({ themeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.periode')}</label>
            <div className="flex gap-2 mt-1">
              <input
                type="date"
                value={presenceData.periodeDebut}
                onChange={(e) => updatePresenceData({ periodeDebut: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
              />
              <span className="self-center text-gray-900 dark:text-white">à</span>
              <input
                type="date"
                value={presenceData.periodeFin}
                onChange={(e) => updatePresenceData({ periodeFin: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
              />
            </div>
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.heure')}</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={presenceData.heureDebut}
                onChange={(e) => updatePresenceData({ heureDebut: e.target.value })}
                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                placeholder="9h"
              />
              <span className="self-center text-gray-900 dark:text-white">à</span>
              <input
                type="text"
                value={presenceData.heureFin}
                onChange={(e) => updatePresenceData({ heureFin: e.target.value })}
                className="w-20 px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded text-center transition-colors duration-300"
                placeholder="17h"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.cadre')}</label>
            <input
              type="text"
              value={presenceData.cadreFormation}
              onChange={(e) => updatePresenceData({ cadreFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.nombreJours')}</label>
            <input
              type="number"
              min="1"
              max="7"
              value={presenceData.nombreJours}
              onChange={(e) => handleNombreJoursChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.lieu')}</label>
            <input
              type="text"
              value={presenceData.lieuFormation}
              onChange={(e) => updatePresenceData({ lieuFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>

          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.formateur')}</label>
            <input
              type="text"
              value={presenceData.formateur}
              onChange={(e) => updatePresenceData({ formateur: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.duree')}</label>
            <input
              type="text"
              value={presenceData.dureeFormation}
              onChange={(e) => updatePresenceData({ dureeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
          <div>
            <label className="font-bold text-gray-900 dark:text-white">{t('step6.mode')}</label>
            <input
              type="text"
              value={presenceData.modeFormation}
              onChange={(e) => updatePresenceData({ modeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-1 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Add Student Section - LIKE CLIENT SELECTION */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white"></h3>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition shadow-md"
              style={{ backgroundColor: ABBK_COLORS.red }}
              onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
              onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
            >
              <Plus size={18} />
              Add New Student
            </button>
          </div>

          {/* Search Students */}
          <div className="mb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors duration-300"
              />
            </div>
          </div>

          {/* Add Student Form */}
          {showAddStudent && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 transition-colors duration-300 mb-3" style={{ borderColor: ABBK_COLORS.red + '40' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 dark:text-white">New Student</h3>
                <button onClick={() => setShowAddStudent(false)}>
                  <X size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Student Name *"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                />
                <input
                  type="text"
                  placeholder="Établissement *"
                  value={newStudent.etablissement}
                  onChange={(e) => setNewStudent({ ...newStudent, etablissement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                />
                <button
                  onClick={handleAddStudent}
                  className="w-full px-4 py-2 text-white rounded-lg text-sm transition shadow-md"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                  onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
                >
                  Add Student
                </button>
              </div>
            </div>
          )}

          {searchTerm && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredStudents.length} student(s) found
            </p>
          )}
        </div>

        {/* Participants Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('step6.participants')}</h3>
            <button
              onClick={addParticipant}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-md font-medium transition"
              style={{ backgroundColor: ABBK_COLORS.red }}
              onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
              onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
            >
              <Plus size={18} />
              {t('step6.addParticipant')}
            </button>
          </div>

          <div className="overflow-x-auto border-2 border-gray-800 dark:border-gray-600 rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700 border-b-2 border-gray-800 dark:border-gray-600">
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-3 text-left font-bold min-w-[250px] text-gray-900 dark:text-white">
                    {t('step6.nomPrenom')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-3 text-left font-bold min-w-[200px] text-gray-900 dark:text-white">
                    {t('step6.etablissement')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-3 text-center font-bold text-gray-900 dark:text-white" colSpan={nombreJours}>
                    {t('step6.jours')}
                  </th>
                  <th className="border-r-2 border-gray-800 dark:border-gray-600 p-3 text-left font-bold min-w-[150px] text-gray-900 dark:text-white">
                    {t('step6.details')}
                  </th>
                  <th className="p-3 w-16"></th>
                </tr>
                {dates.length > 0 && (
                  <tr className="bg-gray-100 dark:bg-gray-600 border-b-2 border-gray-800 dark:border-gray-600">
                    <th className="border-r-2 border-gray-800 dark:border-gray-600"></th>
                    <th className="border-r-2 border-gray-800 dark:border-gray-600"></th>
                    {dates.map((date, idx) => (
                      <th key={idx} className="border-r-2 border-gray-800 dark:border-gray-600 p-2 text-center font-bold text-xs text-gray-900 dark:text-white">
                        {date}
                      </th>
                    ))}
                    <th className="border-r-2 border-gray-800 dark:border-gray-600"></th>
                    <th></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {presenceData.participants.map((participant, pIndex) => (
                  <tr key={pIndex} className="border-b-2 border-gray-800 dark:border-gray-600">
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      {/* SIMPLE DROPDOWN - LIKE CLIENT SELECTION */}
                      <select
                        value={participant.studentId || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleStudentSelect(pIndex, e.target.value);
                          } else {
                            updateParticipant(pIndex, 'nom', '');
                            updateParticipant(pIndex, 'etablissement', '');
                            updateParticipant(pIndex, 'studentId', null);
                          }
                        }}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
                      >
                        <option value="">-- Select Student or Type Below --</option>
                        {filteredStudents.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.name} 
                          </option>
                        ))}
                      </select>
                      {/* Manual input if not selecting from dropdown */}
                      {!participant.studentId && (
                        <input
                          type="text"
                          value={participant.nom}
                          onChange={(e) => updateParticipant(pIndex, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded mt-2 transition-colors duration-300"
                          placeholder="Or type name manually"
                        />
                      )}
                    </td>
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={participant.etablissement}
                        onChange={(e) => updateParticipant(pIndex, 'etablissement', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
                        placeholder={t('step6.etablissement')}
                        readOnly={!!participant.studentId}
                      />
                    </td>
                    {Array.from({ length: nombreJours }).map((_, jIndex) => (
                      <td key={jIndex} className="border-r-2 border-gray-800 dark:border-gray-600 p-2">
                        <div className="flex justify-center">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={participant.jours[jIndex] === '✓'}
                              onChange={() => toggleParticipantJour(pIndex, jIndex)}
                              className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-sm text-gray-900 dark:text-white">
                              {participant.jours[jIndex] === '✓' ? 'Présent' : 'Absent'}
                            </span>
                          </label>
                        </div>
                      </td>
                    ))}
                    <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3">
                      <input
                        type="text"
                        value={participant.details}
                        onChange={(e) => updateParticipant(pIndex, 'details', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded transition-colors duration-300"
                      />
                    </td>
                    <td className="p-3">
                      {presenceData.participants.length > 1 && (
                        <button
                          onClick={() => removeParticipant(pIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-800 dark:border-gray-600">
                  <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3 font-bold text-gray-900 dark:text-white" colSpan="2">
                    {t('step6.formateur')}: {presenceData.formateur}
                  </td>
                  {Array.from({ length: nombreJours }).map((_, idx) => (
                    <td key={idx} className="border-r-2 border-gray-800 dark:border-gray-600 p-2"></td>
                  ))}
                  <td className="border-r-2 border-gray-800 dark:border-gray-600 p-3"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">{t('step6.note')}</h3>
          <textarea
            value={presenceData.notes}
            onChange={(e) => updatePresenceData({ notes: e.target.value })}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors duration-300"
            style={{ focusRingColor: ABBK_COLORS.red }}
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 border-t-2 pt-6">
          <div>
            <label className="font-bold mb-2 block text-gray-900 dark:text-white">{t('step6.dateLe')}</label>
            <input
              type="date"
              value={presenceData.dateLe}
              onChange={(e) => updatePresenceData({ dateLe: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg mb-4 transition-colors duration-300"
            />
            <p className="font-bold mb-3 text-gray-900 dark:text-white">{t('step6.signature')}</p>
            <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg"></div>
          </div>
          <div>
            <p className="font-bold mb-3 mt-10 text-gray-900 dark:text-white">{t('step6.signatureFormateur')}</p>
            <div className="h-24 border-2 border-dashed border-gray-400 dark:border-gray-500 rounded-lg"></div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm font-bold text-gray-900 dark:text-white">{t('step6.signatureABBK')}</p>
        </div>
      </div>
    </div>
  );
}