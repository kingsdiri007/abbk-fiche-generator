import React from 'react';
import { useFormContext } from '../context/FormContext';

export default function Step4Preview() {
  const { formData } = useFormContext();
  
  const isFormation = formData.interventionType === 'formation';
  const docTitle = isFormation 
    ? "FICHE PROGRAMME D'UNE ACTION DE FORMATION"
    : "FICHE D'INSTALLATION";

  return (
    <div className="bg-white rounded-xl shadow-2xl max-w-5xl mx-auto border-4 border-gray-300">
      {/* Document Title */}
      <div className="border-b-2 border-gray-800 p-4 text-center">
        <h2 className="text-lg font-bold uppercase">{docTitle}</h2>
      </div>

      {/* Header Section */}
      <div className="p-6 border-b-2 border-gray-800">
        <div className="flex items-start justify-between">
          {/* Left: Logo */}
          <div className="flex-1">
            <div className="w-48 h-24 mb-3 flex items-center justify-center">
              <img 
                src="/logo-abbk.png" 
                alt="ABBK Logo" 
                className="object-contain w-full h-full rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="text-2xl font-bold text-blue-600">ABBK PhysicsWorks</div>';
                }}
              />
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold">ABBK PhysicsWorks</p>
              <p>Adresse: Cyberparc Régional, 3200, Tataouine, Tunisie.</p>
              <p>Branche: 4eme Etage Pépinière de Technopôle El Ghazela</p>
            </div>
          </div>

          {/* Right: Client Info */}
          <div className="w-64 border-2 border-gray-800 p-3">
            <div className="text-xs space-y-2">
              <p><span className="font-semibold">Client:</span> {formData.clientName || ''}</p>
              <p><span className="font-semibold">Adresse:</span> {formData.address || ''}</p>
              <p><span className="font-semibold">Téléphone:</span> {formData.phone || ''}</p>
              <p><span className="font-semibold">ID:</span> {formData.id || ''}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {isFormation ? (
          /* FORMATION MODE - Show each formation with its tables */
          <div className="space-y-8">
            {(formData.selectedFormations || []).map((formationId, formationIndex) => {
              const formationData = formData.formationsData[formationId] || {};
              const totalTheory = (formationData.schedule || []).reduce((sum, day) => 
                sum + (parseFloat(day.theoryHours) || 0), 0
              );
              const totalPractice = (formationData.schedule || []).reduce((sum, day) => 
                sum + (parseFloat(day.practiceHours) || 0), 0
              );

              return (
                <div key={formationIndex} className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
                  {/* Formation Header */}
                  <div className="bg-purple-600 text-white p-3 rounded-lg mb-4 -mx-4 -mt-4">
                    <h3 className="text-lg font-bold">{formationData.formationName || 'Formation'}</h3>
                  </div>

                  {/* Formation Name and Reference */}
                  <div className="mb-4 text-sm">
                    <p className="mb-1">
                      <span className="font-bold">Nom de formation:</span> {formationData.formationName || ''}
                    </p>
                    <p>
                      <span className="font-bold">Référence:</span> {formationData.formationRef || ''}
                    </p>
                  </div>

                  {/* Prerequisites, Objectives, Competencies */}
                  <table className="w-full border-2 border-gray-800 mb-4 text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-800 p-2 text-left font-bold">Prérequis</th>
                        <th className="border border-gray-800 p-2 text-left font-bold">Objectifs visés</th>
                        <th className="border border-gray-800 p-2 text-left font-bold">Compétences acquises</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-800 p-2 align-top">
                          {formationData.prerequisites || ''}
                        </td>
                        <td className="border border-gray-800 p-2 align-top">
                          {formationData.objectives || ''}
                        </td>
                        <td className="border border-gray-800 p-2 align-top">
                          {formationData.competencies || ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Schedule Table */}
                  <table className="w-full border-2 border-gray-800 mb-3 text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-800 p-2 font-bold w-12">Jours</th>
                        <th className="border border-gray-800 p-2 font-bold text-left">Contenu / Concepts</th>
                        <th className="border border-gray-800 p-2 font-bold text-left">Méthodes</th>
                        <th className="border border-gray-800 p-2 font-bold text-center" colSpan="2">
                          Durée (Heures)
                        </th>
                      </tr>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-800"></th>
                        <th className="border border-gray-800"></th>
                        <th className="border border-gray-800"></th>
                        <th className="border border-gray-800 p-1 font-bold text-center w-16">Théorie</th>
                        <th className="border border-gray-800 p-1 font-bold text-center w-16">Pratique</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formationData.schedule || []).map((day, idx) => (
                        <tr key={idx}>
                          <td className="border border-gray-800 p-2 text-center font-semibold">
                            {day.day}
                          </td>
                          <td className="border border-gray-800 p-2">
                            {day.content}
                          </td>
                          <td className="border border-gray-800 p-2">
                            {day.methods}
                          </td>
                          <td className="border border-gray-800 p-2 text-center">
                            {day.theoryHours}
                          </td>
                          <td className="border border-gray-800 p-2 text-center">
                            {day.practiceHours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Total Hours */}
                  <p className="text-xs font-bold mb-2">
                    Total Théorie: {totalTheory}h | Total Pratique: {totalPractice}h | Total: {totalTheory + totalPractice}h
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          /* LICENSE MODE - Show license table */
          <>
            <div className="mb-3 text-xs">
              <p>
                <span className="font-bold">Nature de l'intervention:</span> {formData.interventionNature || ''}
              </p>
            </div>

            <div className="mb-4 text-xs">
              <p>
                <span className="font-bold">Référence BC:</span> {formData.referenceBC || ''}
              </p>
            </div>

            <table className="w-full border-2 border-gray-800 mb-4 text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-800 p-2 text-left font-bold">Licence(s) installée(s)</th>
                  <th className="border border-gray-800 p-2 text-center font-bold w-20">Quantité</th>
                  <th className="border border-gray-800 p-2 text-left font-bold">Numéro de série</th>
                  <th className="border border-gray-800 p-2 text-left font-bold">Numéro de facture</th>
                </tr>
              </thead>
              <tbody>
                {formData.licenses && formData.licenses.length > 0 && formData.licenses[0].name ? (
                  formData.licenses.map((lic, idx) => 
                    lic.name && (
                      <tr key={idx}>
                        <td className="border border-gray-800 p-2">{lic.name}</td>
                        <td className="border border-gray-800 p-2 text-center">{lic.quantity}</td>
                        <td className="border border-gray-800 p-2">{lic.serial}</td>
                        <td className="border border-gray-800 p-2">{lic.invoice}</td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td className="border border-gray-800 p-2 text-gray-400" colSpan="4">
                      No licenses added
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {/* Intervenant Table (Common for both) */}
        <table className="w-full border-2 border-gray-800 mb-4 text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 p-2 text-left font-bold">Intervenant(s)</th>
              <th className="border border-gray-800 p-2 text-left font-bold">Date d'intervention</th>
              <th className="border border-gray-800 p-2 text-left font-bold">Numéro d'intervention</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 p-2">{formData.intervenant || ''}</td>
              <td className="border border-gray-800 p-2">{formData.interventionDate || ''}</td>
              <td className="border border-gray-800 p-2">{formData.referenceBC || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Observations */}
        <div className="mb-4 text-xs">
          <p>
            <span className="font-bold">Observations:</span> {formData.observations || ''}
          </p>
        </div>

        {/* Signature Section */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="border-2 border-gray-800 p-3 text-xs">
            <p className="font-bold mb-2">Fait à :</p>
            <p className="mb-3">{formData.location || 'Ariana'}</p>
            <p className="font-bold mb-2">Date:</p>
            <p>{new Date().toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="border-2 border-gray-800 p-3">
            <p className="font-bold text-xs mb-2">Remarques client:</p>
            <div className="h-16"></div>
          </div>

          <div className="border-2 border-gray-800 p-3">
            <p className="font-bold text-xs mb-2">Signature client:</p>
            <div className="h-16"></div>
          </div>

          <div className="border-2 border-gray-800 p-3">
            <p className="font-bold text-xs mb-2">Signature d'intervenant:</p>
            <div className="h-16"></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-700 text-white p-3 text-center text-xs">
        <p>© 2024 Sté ABBK PhysicsWorks. Tous les droits réservés.</p>
      </div>
    </div>
  );
}