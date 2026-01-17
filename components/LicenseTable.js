import React, { useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { Trash2, Plus, X } from 'lucide-react';
import { getAllLicenses, addLicense as addLicenseToSupabase, checkIfAdmin, getAllIntervenants } from '../services/supabaseService';

export default function LicenseTable() {
  const { formData, updateLicense, addLicense, removeLicense, updateFormData } = useFormContext();
  const [licenses, setLicenses] = useState([]);
  const [intervenants, setIntervenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [newLicenseName, setNewLicenseName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadLicenses();
    loadIntervenants();
    checkAdminStatus();
  }, []);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const data = await getAllLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Error loading licenses:', error);
      alert('Error loading licenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadIntervenants = async () => {
    try {
      const data = await getAllIntervenants();
      setIntervenants(data);
    } catch (error) {
      console.error('Error loading intervenants:', error);
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

  const handleAddNewLicense = async () => {
    if (!newLicenseName.trim()) {
      alert('Please enter a license name');
      return;
    }

    try {
      await addLicenseToSupabase(newLicenseName);
      await loadLicenses();
      setNewLicenseName('');
      setShowAddLicense(false);
      alert('✅ License added successfully!');
    } catch (error) {
      console.error('Error adding license:', error);
      alert('Error adding license: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="mb-4">
     

      {/* Add License Form */}
      {showAddLicense && (
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-sm text-gray-900 dark:text-white">New License Type</h5>
            <button onClick={() => setShowAddLicense(false)}>
              <X size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="License name (e.g., SOLIDWORKS Premium 2024)"
              value={newLicenseName}
              onChange={(e) => setNewLicenseName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
            />
            <button
              onClick={handleAddNewLicense}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Intervenant Selection */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Intervenant for License Installation *
        </label>
        <select
          value={formData.intervenant || ''}
          onChange={(e) => updateFormData({ intervenant: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 transition-colors duration-300"
        >
          <option value="">-- Select Intervenant --</option>
          {intervenants.map((intervenant) => (
            <option key={intervenant.id} value={intervenant.name}>
              {intervenant.name}
            </option>
          ))}
        </select>
      </div>

      {/* License Selection Table */}
      {formData.licenses.map((license, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
          {/* License Name - Dropdown */}
          <select
            value={license.name}
            onChange={(e) => updateLicense(idx, 'name', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
          >
            <option value="">-- Select License --</option>
            {licenses.map((lic) => (
              <option key={lic.id} value={lic.name}>
                {lic.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Qty"
            min="1"
            value={license.quantity}
            onChange={(e) => updateLicense(idx, 'quantity', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Serial #"
            value={license.serial}
            onChange={(e) => updateLicense(idx, 'serial', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Invoice #"
            value={license.invoice}
            onChange={(e) => updateLicense(idx, 'invoice', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm"
          />
          {formData.licenses.length > 1 && (
            <button
              onClick={() => removeLicense(idx)}
              className="px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition flex items-center justify-center"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addLicense}
        className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
      >
        + Add License Row
      </button>
    </div>
  );
}