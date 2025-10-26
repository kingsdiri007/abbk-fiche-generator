import React, { useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { Trash2, Plus, X } from 'lucide-react';
import { getAllLicenses, addLicense as addLicenseToSupabase, checkIfAdmin } from '../services/supabaseService';

export default function LicenseTable() {
  const { formData, updateLicense, addLicense, removeLicense } = useFormContext();
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddLicense, setShowAddLicense] = useState(false);
  const [newLicenseName, setNewLicenseName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadLicenses();
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
      await loadLicenses(); // Reload list
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
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-700">Licenses</h4>
        {isAdmin && (
          <button
            onClick={() => setShowAddLicense(!showAddLicense)}
            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
          >
            <Plus size={14} />
            Add License Type
          </button>
        )}
      </div>

      {/* Add License Form */}
      {showAddLicense && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-sm">New License Type</h5>
            <button onClick={() => setShowAddLicense(false)}>
              <X size={16} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="License name (e.g., SOLIDWORKS Premium 2024)"
              value={newLicenseName}
              onChange={(e) => setNewLicenseName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
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

      {/* License Selection Table */}
      {formData.licenses.map((license, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
          {/* License Name - Dropdown */}
          <select
            value={license.name}
            onChange={(e) => updateLicense(idx, 'name', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
        + Add License Row
      </button>
    </div>
  );
}