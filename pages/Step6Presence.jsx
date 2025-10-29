import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { Plus, Trash2 } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';

export default function Step6Presence() {
  const { formData, updateFormData } = useFormContext();

  // Auto-fill from previous data
  useEffect(() => {
    if (!formData.presenceData) {
      const planFormation = formData.planData?.formations?.[0] || {};
      const nombreJours = parseInt(planFormation.nombreJours || '2');
      
      updateFormData({
        presenceData: {
          entreprise: formData.clientName || '',
          themeFormation: planFormation.formationName || '',
          periodeDebut: planFormation.dateDebut || '',
          periodeFin: planFormation.dateFin || '',
          cadreFormation: '',
          formateur: planFormation.formateur || formData.intervenant || '',
          nombreJours: planFormation.nombreJours || '2',
          dureeFormation: planFormation.dureeFormation || '',
          modeFormation: 'Présentielle',
          lieuFormation: planFormation.lieuFormation || formData.location || '',
          heureDebut: '9h',
          heureFin: '17h',
          participants: [
            { nom: '', etablissement: '', jours: Array(nombreJours).fill(''), details: '' }
          ],
          formateurSignature: '',
          notes: "* La fiche de présence doit être soigneusement complétée par ....... ABBK et le formateur. Deux copies sont nécessaires : une pour .... et une pour ABBK.\n* Une fiche de présence sur la plateforme ABBK L'inscription doit également être remplie.",
          dateLe: planFormation.dateDebut || formData.interventionDate || ''
        }
      });
    }
  }, [formData.planData, formData.clientName, formData.intervenant, formData.location, formData.interventionDate]);

  const presenceData = formData.presenceData || {
    entreprise: '',
    themeFormation: '',
    periodeDebut: '',
    periodeFin: '',
    cadreFormation: '',
    formateur: '',
    nombreJours: '',
    dureeFormation: '',
    modeFormation: 'Présentielle',
    lieuFormation: '',
    heureDebut: '9h',
    heureFin: '17h',
    participants: [
      { nom: '', etablissement: '', jours: ['', ''], details: '' }
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

  const addParticipant = () => {
    const nombreJours = parseInt(presenceData.nombreJours) || 2;
    updatePresenceData({
      participants: [
        ...presenceData.participants,
        { nom: '', etablissement: '', jours: Array(nombreJours).fill(''), details: '' }
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

  // Get dates for columns
  const getDates = () => {
    const nombreJours = parseInt(presenceData.nombreJours) || 2;
    const dates = [];
    if (presenceData.periodeDebut) {
      const startDate = new Date(presenceData.periodeDebut);
      for (let i = 0; i < nombreJours; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const dates = getDates();

  return (
    <div className="max-w-[95%] mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
       
<div 
  className="text-white p-6 rounded-lg mb-8 -mx-8 -mt-8"
  style={{ backgroundColor: ABBK_COLORS.red }}
>
          <h2 className="text-3xl font-bold text-center">FICHE DE PRÉSENCE</h2>
          <p className="text-center text-sm mt-2 opacity-90">Step 6 of 7</p>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 border-2 border-gray-800">
          <div>
            <label className="text-sm font-bold">Entreprise :</label>
            <input
              type="text"
              value={presenceData.entreprise}
              onChange={(e) => updatePresenceData({ entreprise: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg mt-1"
            />
          </div>
        </div>

        {/* Formation Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm border-2 border-gray-800 p-4">
          <div>
            <label className="font-bold">Thème de formation :</label>
            <input
              type="text"
              value={presenceData.themeFormation}
              onChange={(e) => updatePresenceData({ themeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Période de formation :</label>
            <div className="flex gap-2 mt-1">
              <input
                type="date"
                value={presenceData.periodeDebut}
                onChange={(e) => updatePresenceData({ periodeDebut: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <span className="self-center">à</span>
              <input
                type="date"
                value={presenceData.periodeFin}
                onChange={(e) => updatePresenceData({ periodeFin: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="font-bold">Heure de formation :</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={presenceData.heureDebut}
                onChange={(e) => updatePresenceData({ heureDebut: e.target.value })}
                className="w-20 px-2 py-2 border border-gray-300 rounded text-center"
                placeholder="9h"
              />
              <span className="self-center">à</span>
              <input
                type="text"
                value={presenceData.heureFin}
                onChange={(e) => updatePresenceData({ heureFin: e.target.value })}
                className="w-20 px-2 py-2 border border-gray-300 rounded text-center"
                placeholder="17h"
              />
            </div>
          </div>

          <div>
            <label className="font-bold">Cadre de formation :</label>
            <input
              type="text"
              value={presenceData.cadreFormation}
              onChange={(e) => updatePresenceData({ cadreFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Nombre de jours de formation :</label>
            <input
              type="text"
              value={presenceData.nombreJours}
              onChange={(e) => updatePresenceData({ nombreJours: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Lieu de formation :</label>
            <input
              type="text"
              value={presenceData.lieuFormation}
              onChange={(e) => updatePresenceData({ lieuFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>

          <div>
            <label className="font-bold">Formateur :</label>
            <input
              type="text"
              value={presenceData.formateur}
              onChange={(e) => updatePresenceData({ formateur: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Durée de la formation :</label>
            <input
              type="text"
              value={presenceData.dureeFormation}
              onChange={(e) => updatePresenceData({ dureeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Mode de formation :</label>
            <input
              type="text"
              value={presenceData.modeFormation}
              onChange={(e) => updatePresenceData({ modeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>

        {/* Participants Table */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Liste des participants</h3>
           
<button
 onClick={addParticipant}
  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-md font-medium transition"
  style={{ backgroundColor: ABBK_COLORS.red }}
  onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
  onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
>
              <Plus size={18} />
              Add Participant
            </button>
          </div>

          <div className="overflow-x-auto border-2 border-gray-800 rounded-lg">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-800">
                  <th className="border-r-2 border-gray-800 p-3 text-left font-bold min-w-[200px]">
                    Nom et Prénom
                  </th>
                  <th className="border-r-2 border-gray-800 p-3 text-left font-bold min-w-[200px]">
                    Établissement / Entreprise
                  </th>
                  <th className="border-r-2 border-gray-800 p-3 text-center font-bold" colSpan={dates.length}>
                    Jours
                  </th>
                  <th className="border-r-2 border-gray-800 p-3 text-left font-bold min-w-[150px]">
                    Détails
                  </th>
                  <th className="p-3 w-16"></th>
                </tr>
                {dates.length > 0 && (
                  <tr className="bg-gray-100 border-b-2 border-gray-800">
                    <th className="border-r-2 border-gray-800"></th>
                    <th className="border-r-2 border-gray-800"></th>
                    {dates.map((date, idx) => (
                      <th key={idx} className="border-r-2 border-gray-800 p-2 text-center font-bold text-xs">
                        {date}
                      </th>
                    ))}
                    <th className="border-r-2 border-gray-800"></th>
                    <th></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {presenceData.participants.map((participant, pIndex) => (
                  <tr key={pIndex} className="border-b-2 border-gray-800">
                    <td className="border-r-2 border-gray-800 p-3">
                      <input
                        type="text"
                        value={participant.nom}
                        onChange={(e) => updateParticipant(pIndex, 'nom', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        placeholder="Name"
                      />
                    </td>
                    <td className="border-r-2 border-gray-800 p-3">
                      <input
                        type="text"
                        value={participant.etablissement}
                        onChange={(e) => updateParticipant(pIndex, 'etablissement', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        placeholder="Company"
                      />
                    </td>
                    {dates.map((date, jIndex) => (
                      <td key={jIndex} className="border-r-2 border-gray-800 p-2">
                        <input
                          type="text"
                          value={participant.jours[jIndex] || ''}
                          onChange={(e) => updateParticipantJour(pIndex, jIndex, e.target.value)}
                          className="w-full px-2 py-2 border border-gray-300 rounded text-center"
                          placeholder="✓"
                        />
                      </td>
                    ))}
                    <td className="border-r-2 border-gray-800 p-3">
                      <input
                        type="text"
                        value={participant.details}
                        onChange={(e) => updateParticipant(pIndex, 'details', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                      />
                    </td>
                    <td className="p-3">
                      {presenceData.participants.length > 1 && (
                        <button
                          onClick={() => removeParticipant(pIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-100 border-b-2 border-gray-800">
                  <td className="border-r-2 border-gray-800 p-3 font-bold text-center" colSpan="2">
                    Formateur
                  </td>
                  {dates.map((date, idx) => (
                    <td key={idx} className="border-r-2 border-gray-800 p-2"></td>
                  ))}
                  <td className="border-r-2 border-gray-800 p-3"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Note :</h3>
          <textarea
            value={presenceData.notes}
            onChange={(e) => updatePresenceData({ notes: e.target.value })}
            rows="4"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 border-t-2 pt-6">
          <div>
            <label className="font-bold mb-2 block">Date Le :</label>
            <input
              type="date"
              value={presenceData.dateLe}
              onChange={(e) => updatePresenceData({ dateLe: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-4"
            />
            <p className="font-bold mb-3">Signature</p>
            <div className="h-24 border-2 border-dashed border-gray-400 rounded-lg"></div>
          </div>
          <div>
            <p className="font-bold mb-3 mt-10">Signature de Formateur</p>
            <div className="h-24 border-2 border-dashed border-gray-400 rounded-lg"></div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm font-bold">Signature ABBK PHYSICSWORKS</p>
        </div>
      </div>
    </div>
  );
}