import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, UserCheck,
  AlertCircle, RefreshCw, Phone, Mail, Award
} from 'lucide-react';
import { 
  getAllIntervenants, 
  addIntervenant, 
  updateIntervenant, 
  deleteIntervenant
} from '../services/supabaseService';
import { ProtectedContent } from '../components/ProtectedContent';
import { ABBK_COLORS } from '../utils/theme';

// Intervenant Modal - moved outside
const IntervenantModal = ({ isEdit, formData, setFormData, onSave, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Intervenant' : 'Add New Intervenant'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="John Doe"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="+216 XX XXX XXX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            specialities
          </label>
          <input
            type="text"
            value={formData.specialities}
            onChange={(e) => setFormData({ ...formData, specialities: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="SolidWorks, CAD/CAM, FEA"
          />
        </div>


      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Save size={18} />
          {isEdit ? 'Update' : 'Create'} Intervenant
        </button>
      </div>
    </div>
  </div>
);

export default function AdminIntervenants() {
  const [intervenants, setIntervenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIntervenant, setSelectedIntervenant] = useState(null);
  const [formData, setFormData] = useState(getEmptyIntervenant());

  function getEmptyIntervenant() {
    return {
      name: '',
      email: '',
      phone: '',
      specialities: ''
    };
  }

  useEffect(() => {
    loadIntervenants();
  }, []);

  const loadIntervenants = async () => {
    setLoading(true);
    try {
      const data = await getAllIntervenants();
      setIntervenants(data);
    } catch (error) {
      console.error('Error loading intervenants:', error);
      alert('Error loading intervenants: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(getEmptyIntervenant());
    setShowAddModal(true);
  };

  const handleEdit = (intervenant) => {
    setSelectedIntervenant(intervenant);
    setFormData({
      name: intervenant.name,
      email: intervenant.email || '',
      phone: intervenant.phone || '',
      specialities: intervenant.specialities || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (intervenantId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this intervenant?')) {
      return;
    }

    try {
      await deleteIntervenant(intervenantId);
      await loadIntervenants();
      alert('✅ Intervenant deleted successfully!');
    } catch (error) {
      console.error('Error deleting intervenant:', error);
      alert('❌ Error deleting intervenant: ' + error.message);
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.name) {
      alert('Please fill in the name');
      return;
    }

    try {
      await addIntervenant(formData);
      await loadIntervenants();
      setShowAddModal(false);
      alert('✅ Intervenant added successfully!');
    } catch (error) {
      console.error('Error adding intervenant:', error);
      alert('❌ Error adding intervenant: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.name) {
      alert('Please fill in the name');
      return;
    }

    try {
      await updateIntervenant(selectedIntervenant.id, formData);
      await loadIntervenants();
      setShowEditModal(false);
      alert('✅ Intervenant updated successfully!');
    } catch (error) {
      console.error('Error updating intervenant:', error);
      alert('❌ Error updating intervenant: ' + error.message);
    }
  };

  const filteredIntervenants = intervenants.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.email && i.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (i.specialities && i.specialities.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                  <UserCheck size={24} style={{ color: ABBK_COLORS.red }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Intervenants Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {intervenants.length} active intervenants
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadIntervenants}
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
                  Add Intervenant
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or specialities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ABBK_COLORS.red }}></div>
            </div>
          ) : filteredIntervenants.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No intervenants found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntervenants.map(intervenant => (
                <div key={intervenant.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {intervenant.name}
                        </h3>
                        {intervenant.specialities && (
                          <div className="flex items-center gap-2 mb-2">
                            <Award size={14} className="text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {intervenant.specialities}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      {intervenant.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-gray-400 flex-shrink-0" />
                          <p className="text-gray-600 dark:text-gray-400 truncate">{intervenant.email}</p>
                        </div>
                      )}
                      
                      {intervenant.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          <p className="text-gray-600 dark:text-gray-400">{intervenant.phone}</p>
                        </div>
                      )}

                      
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(intervenant)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(intervenant.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddModal && (
            <IntervenantModal
              isEdit={false}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveAdd}
              onClose={() => setShowAddModal(false)}
            />
          )}

          {showEditModal && (
            <IntervenantModal
              isEdit={true}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveEdit}
              onClose={() => setShowEditModal(false)}
            />
          )}
        </div>
      </div>
    </ProtectedContent>
  );
}