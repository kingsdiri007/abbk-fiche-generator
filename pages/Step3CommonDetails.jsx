import React, { useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { MOCK_INTERVENANTS, generateInterventionNature } from '../utils/mockData';

export default function Step3CommonDetails() {
  const { formData, updateFormData } = useFormContext();
  const isLicenseMode = formData.interventionType === 'license';

  // Auto-fill nature and observations ONLY for license mode
  useEffect(() => {
    if (isLicenseMode && formData.licenses && formData.clientName) {
      const natureText = generateInterventionNature(formData.licenses, formData.clientName);
      updateFormData({
        interventionNature: natureText,
        observations: natureText
      });
    } else if (!isLicenseMode) {
      // Clear nature and observations for formation mode
      updateFormData({
        interventionNature: '',
        observations: ''
      });
    }
  }, [formData.licenses, formData.clientName, isLicenseMode]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Intervention Details</h2>
      
      <div className="space-y-6">
        {/* Nature and Observations - ONLY for License mode */}
        {isLicenseMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nature de l'intervention:
                <span className="text-xs text-gray-500 ml-2">(Auto-generated)</span>
              </label>
              <textarea
                placeholder="Describe the intervention"
                value={formData.interventionNature}
                onChange={(e) => updateFormData({ interventionNature: e.target.value })}
                readOnly
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observations:
                <span className="text-xs text-gray-500 ml-2">(Auto-generated)</span>
              </label>
              <textarea
                placeholder="Additional notes or observations"
                value={formData.observations}
                onChange={(e) => updateFormData({ observations: e.target.value })}
                readOnly
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Référence BC:
            </label>
            <input
              type="text"
              placeholder="Reference BC"
              value={formData.referenceBC}
              onChange={(e) => updateFormData({ referenceBC: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'intervention:
            </label>
            <input
              type="date"
              value={formData.interventionDate}
              onChange={(e) => updateFormData({ interventionDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Intervenant Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervenant(s):
          </label>
          <select
            value={formData.intervenant}
            onChange={(e) => updateFormData({ intervenant: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Intervenant --</option>
            {MOCK_INTERVENANTS.map((intervenant) => (
              <option key={intervenant} value={intervenant}>
                {intervenant}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fait à (Location):
          </label>
          <input
            type="text"
            placeholder="e.g., Ariana, Tunis"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}