import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, BookOpen,
  AlertCircle, RefreshCw, Copy
} from 'lucide-react';
import { 
  getAllFormations,
  addFormation,
  updateFormation,
  deleteFormation
} from '../services/supabaseService';
import { ProtectedContent } from '../components/ProtectedContent';
import { ABBK_COLORS } from '../utils/theme';

const SOFTWARE_OPTIONS = [
  'SolidWorks',
  '3DExperience',
  'Abaqus',
  'MasterCAM',
  'AutoCAD',
  'Custom'
];

// Formation Modal - moved outside
const FormationModal = ({ isEdit, formData, setFormData, onSave, onClose, addScheduleDay, removeScheduleDay, updateScheduleDay }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full my-8">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Formation' : 'Add New Formation'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 max-h-[70vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Formation Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="SolidWorks Advanced"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reference *</label>
              <input
                type="text"
                value={formData.formation_id}
                onChange={(e) => setFormData({ ...formData, formation_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="SW-ADV-2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Software</label>
            <select
              value={formData.software}
              onChange={(e) => setFormData({ ...formData, software: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {SOFTWARE_OPTIONS.map(sw => (
                <option key={sw} value={sw}>{sw}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Prerequisites</label>
            <textarea
              value={formData.prerequisites}
              onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Required knowledge or skills..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Objectives</label>
            <textarea
              value={formData.objectives}
              onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Learning objectives..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Competencies</label>
            <textarea
              value={formData.competencies}
              onChange={(e) => setFormData({ ...formData, competencies: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Skills acquired..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</label>
              <button
                onClick={addScheduleDay}
                className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              >
                <Plus size={16} />
                Add Day
              </button>
            </div>

            <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-2 py-2 text-left text-gray-700 dark:text-gray-300">Day</th>
                    <th className="px-2 py-2 text-left text-gray-700 dark:text-gray-300">Content</th>
                    <th className="px-2 py-2 text-left text-gray-700 dark:text-gray-300">Methods</th>
                    <th className="px-2 py-2 text-center w-20 text-gray-700 dark:text-gray-300">Theory (h)</th>
                    <th className="px-2 py-2 text-center w-20 text-gray-700 dark:text-gray-300">Practice (h)</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.schedule.map((day, idx) => (
                    <tr key={idx} className="border-t border-gray-200 dark:border-gray-600">
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={day.day}
                          onChange={(e) => updateScheduleDay(idx, 'day', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="J1"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          value={day.content}
                          onChange={(e) => updateScheduleDay(idx, 'content', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="2"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          value={day.methods}
                          onChange={(e) => updateScheduleDay(idx, 'methods', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          rows="2"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={day.theoryHours}
                          onChange={(e) => updateScheduleDay(idx, 'theoryHours', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={day.practiceHours}
                          onChange={(e) => updateScheduleDay(idx, 'practiceHours', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-2">
                        {formData.schedule.length > 1 && (
                          <button
                            onClick={() => removeScheduleDay(idx)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
          {isEdit ? 'Update' : 'Create'} Formation
        </button>
      </div>
    </div>
  </div>
);

export default function AdminFormations() {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [softwareFilter, setSoftwareFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [formData, setFormData] = useState(getEmptyFormation());

  function getEmptyFormation() {
    return {
      name: '',
      formation_id: '',
      software: 'SolidWorks',
      prerequisites: '',
      objectives: '',
      competencies: '',
      schedule: [
        { day: 'J1', content: '', methods: '', theoryHours: '', practiceHours: '' }
      ]
    };
  }

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = async () => {
    setLoading(true);
    try {
      const data = await getAllFormations();
      setFormations(data);
    } catch (error) {
      console.error('Error loading formations:', error);
      alert('Error loading formations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(getEmptyFormation());
    setShowAddModal(true);
  };

  const handleEdit = (formation) => {
    setSelectedFormation(formation);
    setFormData({
      name: formation.name,
      formation_id: formation.formation_id,
      software: formation.software,
      prerequisites: formation.prerequisites || '',
      objectives: formation.objectives || '',
      competencies: formation.competencies || '',
      schedule: formation.schedule || [{ day: 'J1', content: '', methods: '', theoryHours: '', practiceHours: '' }]
    });
    setShowEditModal(true);
  };

  const handleDuplicate = (formation) => {
    setFormData({
      name: `${formation.name} (Copy)`,
      formation_id: `${formation.formation_id}-COPY`,
      software: formation.software,
      prerequisites: formation.prerequisites || '',
      objectives: formation.objectives || '',
      competencies: formation.competencies || '',
      schedule: formation.schedule || [{ day: 'J1', content: '', methods: '', theoryHours: '', practiceHours: '' }]
    });
    setShowAddModal(true);
  };

  const handleDelete = async (formation_id) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this formation?')) {
      return;
    }

    try {
      await deleteFormation(formation_id);
      await loadFormations();
      alert('✅ Formation deleted successfully!');
    } catch (error) {
      console.error('Error deleting formation:', error);
      alert('❌ Error deleting formation: ' + error.message);
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.formation_id) {
      alert('Please fill in Name and Reference');
      return;
    }

    try {
      await addFormation(formData);
      await loadFormations();
      setShowAddModal(false);
      alert('✅ Formation added successfully!');
    } catch (error) {
      console.error('Error adding formation:', error);
      alert('❌ Error adding formation: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.formation_id) {
      alert('Please fill in Name and Reference');
      return;
    }

    try {
      await updateFormation(selectedFormation.id, formData);
      await loadFormations();
      setShowEditModal(false);
      alert('✅ Formation updated successfully!');
    } catch (error) {
      console.error('Error updating formation:', error);
      alert('❌ Error updating formation: ' + error.message);
    }
  };

  const addScheduleDay = () => {
    setFormData({
      ...formData,
      schedule: [
        ...formData.schedule,
        { day: `J${formData.schedule.length + 1}`, content: '', methods: '', theoryHours: '', practiceHours: '' }
      ]
    });
  };

  const removeScheduleDay = (index) => {
    setFormData({
      ...formData,
      schedule: formData.schedule.filter((_, i) => i !== index)
    });
  };

  const updateScheduleDay = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData({ ...formData, schedule: newSchedule });
  };

  const filteredFormations = formations.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.formation_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSoftware = softwareFilter === 'all' || f.software === softwareFilter;
    return matchesSearch && matchesSoftware;
  });

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
                  <BookOpen size={24} style={{ color: ABBK_COLORS.red }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Formations Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formations.length} formations • {formations.filter(f => f.is_custom).length} custom
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadFormations}
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
                  Add Formation
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search formations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <select
                value={softwareFilter}
                onChange={(e) => setSoftwareFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Software</option>
                {SOFTWARE_OPTIONS.map(sw => (
                  <option key={sw} value={sw}>{sw}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: ABBK_COLORS.red }}></div>
            </div>
          ) : filteredFormations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No formations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredFormations.map(formation => (
                <div key={formation.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {formation.name}
                          </h3>
                          {formation.is_custom && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ref: {formation.formation_id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Software: {formation.software}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Prerequisites:</span>
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{formation.prerequisites || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Schedule:</span>
                        <p className="text-gray-600 dark:text-gray-400">{formation.schedule?.length || 0} days</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(formation)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicate(formation)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50"
                      >
                        <Copy size={16} />
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(formation.id)}
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
            <FormationModal
              isEdit={false}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveAdd}
              onClose={() => setShowAddModal(false)}
              addScheduleDay={addScheduleDay}
              removeScheduleDay={removeScheduleDay}
              updateScheduleDay={updateScheduleDay}
            />
          )}

          {showEditModal && (
            <FormationModal
              isEdit={true}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveEdit}
              onClose={() => setShowEditModal(false)}
              addScheduleDay={addScheduleDay}
              removeScheduleDay={removeScheduleDay}
              updateScheduleDay={updateScheduleDay}
            />
          )}
        </div>
      </div>
    </ProtectedContent>
  );
}