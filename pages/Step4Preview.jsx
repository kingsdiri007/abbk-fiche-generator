import React from 'react';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function Step4Preview() {
  const { t } = useLanguage();
  const { formData } = useFormContext();
  
  const isFormation = formData.interventionType === 'formation';
  const docTitle = isFormation 
    ? t('step4.formationTitle')
    : t('step4.licenseTitle');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
      {/* Document Title */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white p-6 rounded-t-lg mb-6 -mx-8 -mt-8">
        <h2 className="text-3xl font-bold text-center">{t('step4.preview') || 'Aperçu de la Fiche'}</h2>
      </div>

      <div className="border-t-2 border-b-2 border-gray-800 dark:border-gray-600 py-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/logo-abbk.png" 
              alt="ABBK Logo" 
              className="w-16 h-16 object-contain rounded" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">ABBK PhysicsWorks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{docTitle}</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-600 dark:text-gray-400">
            <p>Cyberparc Régional, 3200, Tataouine</p>
            <p>4ème Étage, Technopôle El Ghazela</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-900 dark:text-gray-200">
        <p><strong>{t('step4.client')}</strong> {formData.clientName || "_______________"}</p>
        <p><strong>{t('step4.address')}</strong> {formData.address || "_______________"}</p>
        {isFormation && (
          <p><strong>{t('step3.nature')}</strong> {formData.interventionNature || "_______________"}</p>
        )}
        <p><strong>{t('step3.referenceBC')}</strong> {formData.referenceBC || "_______________"}</p>
      </div>

      {isFormation ? (
        /* FORMATION MODE - Show each formation with its tables */
        <div className="space-y-8 mt-6">
          {(formData.selectedFormations || []).map((formationId, formationIndex) => {
            const formationData = formData.formationsData[formationId] || {};
            const totalTheory = (formationData.schedule || []).reduce((sum, day) => 
              sum + (parseFloat(day.theoryHours) || 0), 0
            );
            const totalPractice = (formationData.schedule || []).reduce((sum, day) => 
              sum + (parseFloat(day.practiceHours) || 0), 0
            );

            return (
              <div key={formationIndex} className="border-2 rounded-lg p-4 transition-colors duration-300" style={{ borderColor: ABBK_COLORS.red + '40', backgroundColor: ABBK_COLORS.red + '10' }}>
                {/* Formation Header */}
                <div className="text-white p-3 rounded-lg mb-4" style={{ backgroundColor: ABBK_COLORS.red }}>
                  <h3 className="text-lg font-bold">{formationData.formationName || t('step2.formation')}</h3>
                </div>

                {/* Formation Name and Reference */}
                <div className="mb-4 text-sm text-gray-900 dark:text-gray-200">
                  <p className="mb-1">
                    <span className="font-bold">{t('step4.formationName')}</span> {formationData.formationName || ''}
                  </p>
                  <p>
                    <span className="font-bold">{t('step4.reference')}</span> {formationData.formationRef || ''}
                  </p>
                </div>

                {/* Prerequisites, Objectives, Competencies */}
                <table className="w-full border-2 border-gray-800 dark:border-gray-600 mb-4 text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.prerequisites')}</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.objectives')}</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.competencies')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 align-top bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                        {formationData.prerequisites || ''}
                      </td>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 align-top bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                        {formationData.objectives || ''}
                      </td>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 align-top bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                        {formationData.competencies || ''}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Schedule Table */}
                <table className="w-full border-2 border-gray-800 dark:border-gray-600 mb-3 text-xs">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold w-12 text-gray-900 dark:text-white">{t('step4.days')}</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-left text-gray-900 dark:text-white">{t('step4.content')}</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-left text-gray-900 dark:text-white">{t('step4.methods')}</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-center text-gray-900 dark:text-white" colSpan="2">
                        {t('step4.duration')}
                      </th>
                    </tr>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-800 dark:border-gray-600"></th>
                      <th className="border border-gray-800 dark:border-gray-600"></th>
                      <th className="border border-gray-800 dark:border-gray-600"></th>
                      <th className="border border-gray-800 dark:border-gray-600 p-1 font-bold text-center w-16 text-gray-900 dark:text-white">{t('step4.theory')}</th>
                      <th className="border border-gray-800 dark:border-gray-600 p-1 font-bold text-center w-16 text-gray-900 dark:text-white">{t('step4.practice')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(formationData.schedule || []).map((day, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 text-center font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {day.day}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {day.content}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {day.methods}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {day.theoryHours}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {day.practiceHours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total Hours */}
                <p className="text-xs font-bold mb-2 text-gray-900 dark:text-gray-200">
                  {t('step4.totalTheory')} {totalTheory}h | {t('step4.totalPractice')} {totalPractice}h | {t('step4.total')} {totalTheory + totalPractice}h
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* LICENSE MODE - Show license table */
        <>
          <div className="mb-3 text-xs text-gray-900 dark:text-gray-200 mt-6">
            <p>
              <span className="font-bold">{t('step3.nature')}</span> {formData.interventionNature || ''}
            </p>
          </div>

          <div className="mb-4 text-xs text-gray-900 dark:text-gray-200">
            <p>
              <span className="font-bold">{t('step3.referenceBC')}</span> {formData.referenceBC || ''}
            </p>
          </div>

          <table className="w-full border-2 border-gray-800 dark:border-gray-600 mb-4 text-xs">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.licenseInstalled')}</th>
                <th className="border border-gray-800 dark:border-gray-600 p-2 text-center font-bold w-20 text-gray-900 dark:text-white">{t('step4.quantity')}</th>
                <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.serialNumber')}</th>
                <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.invoiceNumber')}</th>
              </tr>
            </thead>
            <tbody>
              {formData.licenses && formData.licenses.length > 0 && formData.licenses[0].name ? (
                formData.licenses.map((lic, idx) => 
                  lic.name && (
                    <tr key={idx}>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{lic.name}</td>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{lic.quantity}</td>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{lic.serial}</td>
                      <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{lic.invoice}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td className="border border-gray-800 dark:border-gray-600 p-2 text-gray-400 dark:text-gray-500" colSpan="4">
                    {t('step4.noLicenses')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Intervenant Table (Common for both) */}
      <table className="w-full border-2 border-gray-800 dark:border-gray-600 mb-4 text-xs mt-6">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.intervenants')}</th>
            <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.interventionDate')}</th>
            <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">{t('step4.interventionNumber')}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{formData.intervenant || ''}</td>
            <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{formData.interventionDate || ''}</td>
            <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">{formData.referenceBC || ''}</td>
          </tr>
        </tbody>
      </table>

      {/* Observations */}
      <div className="mb-4 text-xs text-gray-900 dark:text-gray-200">
        <p>
          <span className="font-bold">{t('step3.observations')}</span> {formData.observations || '_______________'}
        </p>
      </div>

      {/* Signature Section */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="border-2 border-gray-800 dark:border-gray-600 p-3 text-xs bg-white dark:bg-gray-800">
          <p className="font-bold mb-2 text-gray-900 dark:text-white">{t('step4.madeAt')}</p>
          <p className="mb-3 text-gray-700 dark:text-gray-300">{formData.location || '_______________'}</p>
          <p className="font-bold mb-2 text-gray-900 dark:text-white">{t('step4.date')}</p>
          <p className="text-gray-700 dark:text-gray-300">{new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="border-2 border-gray-800 dark:border-gray-600 p-3 bg-white dark:bg-gray-800">
          <p className="font-bold text-xs mb-2 text-gray-900 dark:text-white">{t('step4.clientRemarks')}</p>
          <div className="h-16"></div>
        </div>

        <div className="border-2 border-gray-800 dark:border-gray-600 p-3 bg-white dark:bg-gray-800">
          <p className="font-bold text-xs mb-2 text-gray-900 dark:text-white">{t('step4.clientSignature')}</p>
          <div className="h-16"></div>
        </div>

        <div className="border-2 border-gray-800 dark:border-gray-600 p-3 bg-white dark:bg-gray-800">
          <p className="font-bold text-xs mb-2 text-gray-900 dark:text-white">{t('step4.intervenantSignature')}</p>
          <div className="h-16"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-white p-3 text-center text-xs" style={{ backgroundColor: ABBK_COLORS.black }}>
        <p>{t('step4.footer')}</p>
      </div>
    </div>
  );
}