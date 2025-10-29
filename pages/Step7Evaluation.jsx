import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';

export default function Step7Evaluation() {
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
    { field: 'niveauInitial', label: 'Niveau Initial' },
    { field: 'connaissancesTheoriques', label: 'Connaissances théoriques' },
    { field: 'competencesPratiques', label: 'Compétences pratiques' },
    { field: 'niveauParticipation', label: 'Niveau de participation active' },
    { field: 'contributionDiscussions', label: 'Contribution aux discussions' },
    { field: 'bonneComprehension', label: 'A démontré une bonne compréhension' },
    { field: 'capaciteAppliquer', label: 'Capacité à appliquer les connaissances' },
    { field: 'niveauCompetences', label: 'Niveau des compétences techniques acquises pendant la formation' },
    { field: 'attitudeGenerale', label: 'Attitude générale pendant la formation' },
    { field: 'participantPonctuel', label: 'Le participant a-t-il été ponctuel et assidu' },
    { field: 'amelioration', label: 'A montré une amélioration significative pendant la formation' }
  ];

  return (
    <div className="max-w-[98%] mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div 
  className="text-white p-6 rounded-lg mb-8 -mx-8 -mt-8"
  style={{ backgroundColor: ABBK_COLORS.darkred }}
>
          <h2 className="text-3xl font-bold text-center">FICHE D'ÉVALUATION</h2>
          <h3 className="text-xl text-center mt-2">DES PARTICIPANTS</h3>
          <p className="text-center text-sm mt-2 opacity-90">Step 7 of 7 - Final Step!</p>
        </div>

        {/* Header Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 border-2 border-gray-800 text-sm">
          <div>
            <label className="font-bold">Thème de formation :</label>
            <input
              type="text"
              value={evaluationData.themeFormation}
              onChange={(e) => updateEvaluationData({ themeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Période de formation :</label>
            <div className="flex gap-2 mt-1">
              <input
                type="date"
                value={evaluationData.periodeDebut}
                onChange={(e) => updateEvaluationData({ periodeDebut: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
              <span className="self-center">à</span>
              <input
                type="date"
                value={evaluationData.periodeFin}
                onChange={(e) => updateEvaluationData({ periodeFin: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>
          <div>
            <label className="font-bold">Durée de la formation :</label>
            <input
              type="text"
              value={evaluationData.dureeFormation}
              onChange={(e) => updateEvaluationData({ dureeFormation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
          <div>
            <label className="font-bold">Formateur :</label>
            <input
              type="text"
              value={evaluationData.formateur}
              onChange={(e) => updateEvaluationData({ formateur: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded mt-1"
            />
          </div>
        </div>

        {/* Evaluation Table */}
        <div className="mb-6 overflow-x-auto border-2 border-gray-800 rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-gray-800 p-2 text-left font-bold" rowSpan="2" style={{minWidth: '200px'}}>
                  
                </th>
                <th className="border-2 border-gray-800 p-2 text-center font-bold" colSpan={evaluationData.evaluations.length}>
                  Liste des participants
                </th>
              </tr>
              <tr className="bg-gray-100">
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <th key={idx} className="border-2 border-gray-800 p-2 text-center font-bold" style={{minWidth: '100px'}}>
                    {evaluation.participantName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Section 1: Informations sur le Niveau */}
              <tr className="bg-gray-300">
                <td className="border-2 border-gray-800 p-2 font-bold" colSpan={evaluationData.evaluations.length + 1}>
                  Informations sur le Niveau
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Niveau Initial</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.niveauInitial}
                      onChange={(e) => updateEvaluation(idx, 'niveauInitial', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Connaissances théoriques</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.connaissancesTheoriques}
                      onChange={(e) => updateEvaluation(idx, 'connaissancesTheoriques', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Compétences pratiques</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.competencesPratiques}
                      onChange={(e) => updateEvaluation(idx, 'competencesPratiques', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>

              {/* Section 2: Participation et engagement */}
              <tr className="bg-gray-300">
                <td className="border-2 border-gray-800 p-2 font-bold" colSpan={evaluationData.evaluations.length + 1}>
                  Participation et engagement
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Niveau de participation active</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.niveauParticipation}
                      onChange={(e) => updateEvaluation(idx, 'niveauParticipation', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Contribution aux discussions</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.contributionDiscussions}
                      onChange={(e) => updateEvaluation(idx, 'contributionDiscussions', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>

              {/* Section 3: Compréhension du contenu */}
              <tr className="bg-gray-300">
                <td className="border-2 border-gray-800 p-2 font-bold" colSpan={evaluationData.evaluations.length + 1}>
                  Compréhension du contenu
                </td>
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">A démontré une bonne compréhension</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.bonneComprehension}
                      onChange={(e) => updateEvaluation(idx, 'bonneComprehension', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Capacité à appliquer les connaissances</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.capaciteAppliquer}
                      onChange={(e) => updateEvaluation(idx, 'capaciteAppliquer', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Niveau des compétences techniques acquises pendant la formation</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.niveauCompetences}
                      onChange={(e) => updateEvaluation(idx, 'niveauCompetences', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Attitude générale pendant la formation</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.attitudeGenerale}
                      onChange={(e) => updateEvaluation(idx, 'attitudeGenerale', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">Le participant a-t-il été ponctuel et assidu</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.participantPonctuel}
                      onChange={(e) => updateEvaluation(idx, 'participantPonctuel', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border-2 border-gray-800 p-2 font-semibold">A montré une amélioration significative pendant la formation</td>
                {evaluationData.evaluations.map((evaluation, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={evaluation.amelioration}
                      onChange={(e) => updateEvaluation(idx, 'amelioration', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                ))}
              </tr>

              {/* Note Général Row */}
              <tr className="bg-green-100">
                <td className="border-2 border-gray-800 p-2 font-bold">Note Général</td>
                {evaluationData.noteGeneral.slice(0, evaluationData.evaluations.length).map((note, idx) => (
                  <td key={idx} className="border-2 border-gray-800 p-1">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => updateNoteGeneral(idx, e.target.value)}
                      className="w-full px-2 py-1 border-2 border-green-400 rounded text-center font-bold"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Note :</h3>
          <textarea
            value={evaluationData.notes}
            onChange={(e) => updateEvaluationData({ notes: e.target.value })}
            rows="3"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 border-t-2 pt-6">
          <div>
            <label className="font-bold mb-2 block">Date Le :</label>
            <input
              type="date"
              value={evaluationData.dateLe}
              onChange={(e) => updateEvaluationData({ dateLe: e.target.value })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg mb-4"
            />
            <p className="font-bold mb-3">Signature de Formateur</p>
            <div className="h-24 border-2 border-dashed border-gray-400 rounded-lg"></div>
          </div>
          <div>
            <p className="font-bold mb-3 mt-10">Signature ABBK PHYSICSWORKS</p>
            <div className="h-24 border-2 border-dashed border-gray-400 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}