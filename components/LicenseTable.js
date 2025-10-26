
import React from 'react';
import { useFormContext } from '../context/FormContext';
import { Trash2 } from 'lucide-react';
import { MOCK_LICENSES } from '../utils/mockData';

export default function LicenseTable() {
  const { formData, updateLicense, addLicense, removeLicense } = useFormContext();

  return (
    <div className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-3">Licenses</h4>
      {formData.licenses.map((license, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
          {/* License Name - Dropdown */}
          <select
            value={license.name}
            onChange={(e) => updateLicense(idx, 'name', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">-- Select License --</option>
            {MOCK_LICENSES.map((lic) => (
              <option key={lic} value={lic}>
                {lic}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Qty"
            min="1"
            value={license.quantity}
            onChange={(e) => updateLicense(idx, 'quantity', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Serial #"
            value={license.serial}
            onChange={(e) => updateLicense(idx, 'serial', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Invoice #"
            value={license.invoice}
            onChange={(e) => updateLicense(idx, 'invoice', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          {formData.licenses.length > 1 && (
            <button
              onClick={() => removeLicense(idx)}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addLicense}
        className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
      >
        + Add License
      </button>
    </div>
  );
}