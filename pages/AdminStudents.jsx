// src/pages/AdminStudents.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, GraduationCap,
  AlertCircle, RefreshCw, Building, History
} from 'lucide-react';
import { 
  getAllStudents, 
  addStudent, 
  getStudentWithFormations
} from '../services/supabaseService';
import { ProtectedContent } from '../components/ProtectedContent';
import { ABBK_COLORS } from '../utils/theme';

// Add Student Modal - moved outside
const AddStudentModal = ({ formData, setFormData, onSave, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Student
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Student Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Établissement *
          </label>
          <input
            type="text"
            value={formData.etablissement}
            onChange={(e) => setFormData({ ...formData, etablissement: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="University/Company Name"
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
          Add Student
        </button>
      </div>
    </div>
  </div>
);

// History Modal - moved outside
const HistoryModal = ({ studentHistory, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Formation History - {studentHistory.name}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6">
        {studentHistory.student_formations && studentHistory.student_formations.length > 0 ? (
          <div className="space-y-4">
            {studentHistory.student_formations.map((formation, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {formation.formation_name}
                  </h3>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
                    {formation.note_general}/10
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed: {new Date(formation.completion_date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No formation history yet
          </div>
        )}
      </div>
    </div>
  </div>
);

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [formData, setFormData] = useState({ name: '', etablissement: '' });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Error loading students: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({ name: '', etablissement: '' });
    setShowAddModal(true);
  };

  const handleViewHistory = async (student) => {
    try {
      const data = await getStudentWithFormations(student.id);
      setStudentHistory(data);
      setSelectedStudent(student);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading history:', error);
      alert('Error loading formation history: ' + error.message);
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.etablissement) {
      alert('Please fill in both Name and Établissement');
      return;
    }

    try {
      await addStudent(formData);
      await loadStudents();
      setShowAddModal(false);
      alert('✅ Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('❌ Error adding student: ' + error.message);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.etablissement && s.etablissement.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  <GraduationCap size={24} style={{ color: ABBK_COLORS.red }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Students Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {students.length} total students
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadStudents}
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
                  Add Student
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search students..."
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
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No students found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map(student => (
                <div key={student.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {student.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <Building size={14} className="flex-shrink-0" />
                      <p className="truncate">{student.etablissement}</p>
                    </div>

                    <button
                      onClick={() => handleViewHistory(student)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      <History size={16} />
                      View Formation History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showAddModal && (
            <AddStudentModal
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveAdd}
              onClose={() => setShowAddModal(false)}
            />
          )}

          {showHistoryModal && studentHistory && (
            <HistoryModal
              studentHistory={studentHistory}
              onClose={() => setShowHistoryModal(false)}
            />
          )}
        </div>
      </div>
    </ProtectedContent>
  );
}