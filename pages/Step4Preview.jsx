import React, { useMemo } from 'react';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';
import { generateInterventionNature } from '../utils/mockData';

export default function Step4Preview() {
  const { t } = useLanguage();
  const { formData } = useFormContext();
  
  const isFormation = formData.interventionType === 'formation';
  const docTitle = isFormation 
    ? t('step4.formationTitle')
    : t('step4.licenseTitle');

  // Always compute the intervention nature dynamically
  const interventionNatureText = useMemo(() => {
    if (isFormation) {
      return formData.interventionNature || "_______________";
    } else {
      // For license, always recalculate from current licenses
      return generateInterventionNature(formData.licenses, formData.clientName);
    }
  }, [isFormation, formData.interventionNature, formData.licenses, formData.clientName]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {/* Document Title */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white p-4 sm:p-6 rounded-t-lg mb-4 sm:mb-6 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center">
          {t('step4.preview') || 'Aperçu de la Fiche'}
        </h2>
      </div>

      <div className="border-t-2 border-b-2 border-gray-800 dark:border-gray-600 py-4 sm:py-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="/logo-abbk.png" 
              alt="ABBK Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded" 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">ABBK PhysicsWorks</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{docTitle}</p>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs sm:text-sm text-gray-600 dark:text-gray-400 w-full sm:w-auto">
            <p>Cyberparc Régional, 3200, Tataouine</p>
            <p>4ème Étage, Technopôle El Ghazela</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs sm:text-sm text-gray-900 dark:text-gray-200">
        <p><strong>{t('step4.client')}</strong> {formData.clientName || "_______________"}</p>
        <p><strong>{t('step4.address')}</strong> {formData.address || "_______________"}</p>
        {isFormation && (
          <p><strong>{t('step3.nature')}</strong> {interventionNatureText}</p>
        )}
        <p><strong>{t('step3.referenceBC')}</strong> {formData.referenceBC || "_______________"}</p>
      </div>

      {isFormation ? (
        /* FORMATION MODE - Show each formation with its tables */
        <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
          {(formData.selectedFormations || []).map((formationId, formationIndex) => {
            const formationData = formData.formationsData[formationId] || {};
            const totalTheory = (formationData.schedule || []).reduce((sum, day) => 
              sum + (parseFloat(day.theoryHours) || 0), 0
            );
            const totalPractice = (formationData.schedule || []).reduce((sum, day) => 
              sum + (parseFloat(day.practiceHours) || 0), 0
            );

            return (
              <div key={formationIndex} className="border-2 rounded-lg p-3 sm:p-4 transition-colors duration-300" style={{ borderColor: ABBK_COLORS.red + '40', backgroundColor: ABBK_COLORS.red + '10' }}>
                {/* Formation Header */}
                <div className="text-white p-3 sm:p-4 rounded-lg mb-3 sm:mb-4" style={{ backgroundColor: ABBK_COLORS.red }}>
                  <h3 className="text-base sm:text-lg font-bold">{formationData.formationName || t('step2.formation')}</h3>
                </div>

                {/* Formation Name and Reference */}
                <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-900 dark:text-gray-200">
                  <p className="mb-1">
                    <span className="font-bold">{t('step4.formationName')}</span> {formationData.formationName || ''}
                  </p>
                  <p>
                    <span className="font-bold">{t('step4.reference')}</span> {formationData.formationRef || ''}
                  </p>
                </div>

                {/* Prerequisites, Objectives, Competencies - Responsive */}
                <div className="overflow-x-auto mb-3 sm:mb-4">
                  <p className="text-xs text-gray-500 mb-2 sm:hidden">ℹ️ Scroll to see all columns</p>
                  <table className="w-full border-2 border-gray-800 dark:border-gray-600 text-xs min-w-[600px]">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                          {t('step4.prerequisites')}
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                          {t('step4.objectives')}
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                          {t('step4.competencies')}
                        </th>
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
                </div>

                {/* Schedule Table - Responsive */}
                <div className="overflow-x-auto mb-3">
                  <p className="text-xs text-gray-500 mb-2 sm:hidden">ℹ️ Scroll horizontally to view schedule</p>
                  <table className="w-full border-2 border-gray-800 dark:border-gray-600 text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold w-12 text-gray-900 dark:text-white">
                          {t('step4.days')}
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-left text-gray-900 dark:text-white">
                          {t('step4.content')}
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-left text-gray-900 dark:text-white">
                          {t('step4.methods')}
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-left w-24 text-gray-900 dark:text-white">
                          Intervenant
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-2 font-bold text-center text-gray-900 dark:text-white" colSpan="2">
                          {t('step4.duration')}
                        </th>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-gray-700">
                        <th className="border border-gray-800 dark:border-gray-600"></th>
                        <th className="border border-gray-800 dark:border-gray-600"></th>
                        <th className="border border-gray-800 dark:border-gray-600"></th>
                        <th className="border border-gray-800 dark:border-gray-600"></th>
                        <th className="border border-gray-800 dark:border-gray-600 p-1 font-bold text-center w-16 text-gray-900 dark:text-white">
                          {t('step4.theory')}
                        </th>
                        <th className="border border-gray-800 dark:border-gray-600 p-1 font-bold text-center w-16 text-gray-900 dark:text-white">
                          {t('step4.practice')}
                        </th>
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
                          <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                            {day.intervenant || '-'}
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
                </div>

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
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 text-sm text-gray-900 dark:text-gray-200 mt-6 transition-colors duration-300">
            <p className="mb-1">
              <span className="font-bold">{t('step3.nature')}</span>
            </p>
            <p className="text-gray-700 dark:text-gray-300 pl-2">
              {interventionNatureText}
            </p>
          </div>

          <div className="mb-4 text-sm text-gray-900 dark:text-gray-200">
            <p>
              <span className="font-bold">{t('step3.referenceBC')}</span> {formData.referenceBC || ''}
            </p>
          </div>

          {/* License Table - Responsive */}
          <div className="overflow-x-auto mb-4">
            <p className="text-xs text-gray-500 mb-2 sm:hidden">ℹ️ Scroll to see all license details</p>
            <table className="w-full border-2 border-gray-800 dark:border-gray-600 text-xs min-w-[600px]">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                    {t('step4.licenseInstalled')}
                  </th>
                  <th className="border border-gray-800 dark:border-gray-600 p-2 text-center font-bold w-20 text-gray-900 dark:text-white">
                    {t('step4.quantity')}
                  </th>
                  <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                    {t('step4.serialNumber')}
                  </th>
                  <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                    {t('step4.invoiceNumber')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.licenses && formData.licenses.length > 0 && formData.licenses[0].name ? (
                  formData.licenses.map((lic, idx) => 
                    lic.name && (
                      <tr key={idx}>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {lic.name}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {lic.quantity}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {lic.serial}
                        </td>
                        <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                          {lic.invoice}
                        </td>
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
          </div>
        </>
      )}

      {/* Intervenant Table (Common for both) - Responsive */}
      <div className="overflow-x-auto mb-4 mt-4 sm:mt-6">
        <table className="w-full border-2 border-gray-800 dark:border-gray-600 text-xs min-w-[500px]">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                {t('step4.intervenants')}
              </th>
              <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                {t('step4.interventionDate')}
              </th>
              <th className="border border-gray-800 dark:border-gray-600 p-2 text-left font-bold text-gray-900 dark:text-white">
                {t('step4.interventionNumber')}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                {formData.intervenant || ''}
              </td>
              <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                {formData.interventionDate || ''}
              </td>
              <td className="border border-gray-800 dark:border-gray-600 p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                {formData.referenceBC || ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signature Section - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <div className="border-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 text-xs bg-white dark:bg-gray-800">
          <p className="font-bold mb-2 text-gray-900 dark:text-white">{t('step4.madeAt')}</p>
          <p className="mb-2 sm:mb-3 text-gray-700 dark:text-gray-300 truncate">{formData.location || '_______________'}</p>
          <p className="font-bold mb-2 text-gray-900 dark:text-white">{t('step4.date')}</p>
          <p className="text-gray-700 dark:text-gray-300">{new Date().toLocaleDateString('fr-FR')}</p>
        </div>

        <div className="border-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 bg-white dark:bg-gray-800">
          <p className="font-bold text-xs mb-2 text-gray-900 dark:text-white">{t('step4.clientRemarks')}</p>
          <div className="h-12 sm:h-16"></div>
        </div>

        <div className="border-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 bg-white dark:bg-gray-800">
          <p className="font-bold text-xs mb-2 text-gray-900 dark:text-white">{t('step4.clientSignature')}</p>
          <div className="h-12 sm:h-16"></div>
        </div>

        <div className="border-2 border-gray-800 dark:border-gray-600 p-2 sm:p-3 bg-white dark:bg-gray-800">
          <p className="font-bold text-xs mb-2 text-gray-900 dark:text-white">{t('step4.intervenantSignature')}</p>
          <div className="h-12 sm:h-16"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-white p-2 sm:p-3 text-center text-xs" style={{ backgroundColor: ABBK_COLORS.black }}>
        <p>{t('step4.footer')}</p>
      </div>
    </div>
  );
}