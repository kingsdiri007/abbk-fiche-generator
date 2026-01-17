// src/pages/AdminLicenses.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, Key,
  AlertCircle, RefreshCw, Package
} from 'lucide-react';
import { 
  getAllLicenses, 
  addLicense, 
  deleteLicense
} from '../services/supabaseService';
import { ProtectedContent } from '../components/ProtectedContent';
import { ABBK_COLORS } from '../utils/theme';

const SOFTWARE_CATEGORIES = [
  'SolidWorks',
  '3DExperience',
  'Abaqus',
  'MasterCAM',
  'AutoCAD',
  'Other'
];

export default function AdminLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', category: 'SolidWorks' });

  useEffect(() => {
    loadLicenses();
  }, []);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const data = await getAllLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Error loading licenses:', error);
      alert('Error loading licenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', category: 'SolidWorks' });
    setShowAddModal(true);
  };

  const handleDelete = async (licenseId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this license type?')) {
      return;
    }

    try {
      await deleteLicense(licenseId);
      await loadLicenses();
      alert('✅ License deleted successfully!');
    } catch (error) {
      console.error('Error deleting license:', error);
      alert('❌ Error deleting license: ' + error.message);
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.name) {
      alert('Please fill in the license name');
      return;
    }

    try {
      await addLicense(formData.name, formData.category);
      await loadLicenses();
      setShowAddModal(false);
      alert('✅ License added successfully!');
    } catch (error) {
      console.error('Error adding license:', error);
      alert('❌ Error adding license: ' + error.message);
    }
  };

  const filteredLicenses = licenses.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedLicenses = SOFTWARE_CATEGORIES.reduce((acc, category) => {
    acc[category] = filteredLicenses.filter(l => l.category === category);
    return acc;
  }, {});

  return (
    <ProtectedContent requiredRole="admin" showMessage={true}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors duration-300">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${ABBK_COLORS.red}20` }}
                >
                  <Key size={24} style={{ color: ABBK_COLORS.red }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    License Types Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {licenses.length} license types available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadLicenses}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>

                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md hover:shadow-lg"
                  style={{ backgroundColor: ABBK_COLORS.red }}
                >
                  <Plus size={18} />
                  Add License Type
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search license types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {SOFTWARE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ABBK_COLORS.red }}></div>
            </div>
          ) : filteredLicenses.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No licenses found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {SOFTWARE_CATEGORIES.map(category => {
                const categoryLicenses = groupedLicenses[category];
                if (categoryLicenses.length === 0 && categoryFilter !== 'all') return null;

                return (
                  <div key={category} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Package size={20} style={{ color: ABBK_COLORS.red }} />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category}
                      </h2>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-full">
                        {categoryLicenses.length}
                      </span>
                    </div>

                    {categoryLicenses.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No licenses in this category
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryLicenses.map(license => (
                          <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {license.name}
                            </span>
                            <button
                              onClick={() => handleDelete(license.id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Add License Type
                  </h2>
                  <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      License Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., SolidWorks Premium 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {SOFTWARE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAdd}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save size={18} />
                    Add License
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedContent>
  );
}