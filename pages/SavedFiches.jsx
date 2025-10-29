import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User,
  Briefcase,
  Eye,
  RefreshCw,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllPDFs, deletePDF } from '../services/supabaseService';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';

export default function SavedFiches() {
  const navigate = useNavigate();
  const { setFormData, setCurrentStep } = useFormContext();
  const [fiches, setFiches] = useState([]);
  const [filteredFiches, setFilteredFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadFiches();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, fiches]);

  const loadFiches = async () => {
    setLoading(true);
    try {
      const data = await getAllPDFs();
      setFiches(data);
    } catch (error) {
      console.error('Error loading fiches:', error);
      alert('Error loading fiches: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...fiches];

    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.fiche_type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(f => {
        const clientName = f.clients?.name?.toLowerCase() || '';
        const clientId = f.clients?.client_id?.toLowerCase() || '';
        const fileName = f.filename?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return clientName.includes(search) || 
               clientId.includes(search) || 
               fileName.includes(search);
      });
    }

    setFilteredFiches(filtered);
  };

  const handleDelete = async (ficheId) => {
    if (!window.confirm('Are you sure you want to delete this fiche?')) {
      return;
    }

    try {
      await deletePDF(ficheId);
      alert('✅ Fiche deleted successfully!');
      loadFiches();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Error deleting: ' + error.message);
    }
  };

  const handleEdit = (fiche) => {
    // Load the fiche data into the form context
    if (!fiche.form_data) {
      alert('⚠️ This fiche does not have editable data');
      return;
    }

    // Set the form data from the saved fiche
    setFormData(fiche.form_data);
    
    // Determine which step to start at
    if (fiche.fiche_type === 'formation') {
      // For formation, start at step 1 with all data pre-filled
      setCurrentStep(1);
    } else {
      // For license, start at step 1
      setCurrentStep(1);
    }

    // Navigate to create page
    navigate('/create');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page container max-w-7xl mx-auto px-6 py-8">
  <div className="flex items-center justify-between mb-8">
    <div>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Saved Fiches</h2>
      <p className="text-gray-600 dark:text-gray-400 mt-1">{filteredFiches.length} fiches found</p>

        </div>
        
<button
  onClick={loadFiches}
  disabled={loading}
  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 shadow-md"
  style={{ backgroundColor: ABBK_COLORS.red }}
  onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = ABBK_COLORS.darkred)}
  onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = ABBK_COLORS.red)}
>
  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
  Refresh
</button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6 transition-colors duration-300">

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by client name, ID, or filename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="formation">Formation Only</option>
              <option value="license">License Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fiches List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading fiches...</p>
          </div>
        </div>
      ) : filteredFiches.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <FileText size={64} className="text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">No fiches found</p>
          <p className="text-gray-400">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first fiche to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiches.map((fiche) => (
            <div key={fiche.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">

              {/* Card Header */}
              <div className={`p-4 rounded-t-xl ${
  fiche.fiche_type === 'formation' 
    ? 'text-white'
    : 'text-white'
}`}
style={{ 
  backgroundColor: fiche.fiche_type === 'formation' 
    ? ABBK_COLORS.red 
    : ABBK_COLORS.darkred 
}}
>
                <div className="flex items-center justify-between text-white">
                  <span className="text-sm font-semibold uppercase">
                    {fiche.fiche_type === 'formation' ? '📚 Formation' : '🔧 License'}
                  </span>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    {fiche.filename?.split('.')[0]?.substring(0, 15) || 'PDF'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="truncate font-semibold">
                      {fiche.clients?.name || 'Unknown Client'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="truncate">
                      {fiche.clients?.client_id || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>{formatDate(fiche.created_at)}</span>
                  </div>
                </div>

                {/* Formations Info */}
                
{fiche.form_data?.selectedFormations && fiche.form_data.selectedFormations.length > 0 && (
  <div className="pt-2 border-t dark:border-gray-700">
    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Formations:</p>
    <div className="flex flex-wrap gap-1">
      {fiche.form_data.selectedFormations.slice(0, 2).map((formId, idx) => (
        <span 
          key={idx} 
          className="text-xs text-white px-2 py-1 rounded"
          style={{ backgroundColor: ABBK_COLORS.red }}
        >
          {formId.substring(0, 10)}...
        </span>
      ))}
    </div>
  </div>
)}

                {/* Licenses Info */}
                {fiche.form_data?.licenses && fiche.form_data.licenses[0]?.name && (
                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Licenses:</p>
                    <div className="flex flex-wrap gap-1">
                      {fiche.form_data.licenses.filter(l => l.name).slice(0, 2).map((lic, idx) => (
                        <span key={idx} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          {lic.name.substring(0, 15)}... ({lic.quantity})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer - Actions */}
              <div className="p-4 border-t flex gap-2">
                
<button
  onClick={() => handleEdit(fiche)}
  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition text-sm shadow-md"
  style={{ backgroundColor: ABBK_COLORS.red }}
  onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
  onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
  title="Edit this fiche"
>
  <Edit size={16} />
  Edit
</button>

              
<a
  href={fiche.publicUrl}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition text-sm shadow-md"
  style={{ backgroundColor: ABBK_COLORS.black }}
  title="View PDF"
>
  <Eye size={16} />
</a>
                
<a
  href={fiche.publicUrl}
  download
  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-md"
  title="Download PDF"
>
  <Download size={16} />
</a>
                <button
                  onClick={() => handleDelete(fiche.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                  title="Delete fiche"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}