import React, { useEffect, useState } from 'react';
import { 
  FileText, Download, Trash2, Search, Filter, Calendar, User,
  Briefcase, Eye, RefreshCw, Edit, CheckCircle, Circle, Package,
  XCircle, Clock, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllFormationPacks, getAllPDFs, deletePDF, deleteFormationPack } from '../services/supabaseService';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function SavedFiches() {
  const navigate = useNavigate();
  const { setFormData, setCurrentStep } = useFormContext();
  const [formationPacks, setFormationPacks] = useState([]);
  const [licenseFiches, setLicenseFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // New: all, in_progress, completed
  const [filteredItems, setFilteredItems] = useState([]);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterType, statusFilter, formationPacks, licenseFiches]);

  const loadData = async () => {
    setLoading(true);
    try {
      const packs = await getAllFormationPacks();
      setFormationPacks(packs);
      
      const allPdfs = await getAllPDFs();
      const licenses = allPdfs.filter(pdf => pdf.fiche_type === 'license' && !pdf.pack_id);
      setLicenseFiches(licenses);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let items = [];
    
    if (filterType === 'all' || filterType === 'formation') {
      items = [...items, ...formationPacks.map(pack => ({ ...pack, itemType: 'pack' }))];
    }
    
    if (filterType === 'all' || filterType === 'license') {
      items = [...items, ...licenseFiches.map(fiche => ({ ...fiche, itemType: 'license' }))];
    }

    // Filter by status (for formation packs only)
    if (statusFilter !== 'all') {
      items = items.filter(item => {
        if (item.itemType !== 'pack') return true;
        return item.status === statusFilter;
      });
    }

    if (searchTerm) {
      items = items.filter(item => {
        const clientName = item.clients?.name?.toLowerCase() || '';
        const clientId = item.clients?.client_id?.toLowerCase() || '';
        const packName = item.pack_name?.toLowerCase() || '';
        const fileName = item.filename?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        
        return clientName.includes(search) || 
               clientId.includes(search) || 
               packName.includes(search) ||
               fileName.includes(search);
      });
    }

    setFilteredItems(items);
  };

  const handleDeletePack = async (packId) => {
    if (!window.confirm('⚠️ This will delete the entire formation pack and ALL its PDFs. Continue?')) {
      return;
    }

    try {
      await deleteFormationPack(packId);
      alert('✅ Formation pack deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting pack:', error);
      alert('❌ Error deleting: ' + error.message);
    }
  };

  const handleDeleteLicense = async (ficheId) => {
    if (!window.confirm('Are you sure you want to delete this license fiche?')) {
      return;
    }

    try {
      await deletePDF(ficheId);
      alert('✅ License fiche deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Error deleting: ' + error.message);
    }
  };

  const getNextIncompleteStep = (pack) => {
    const progress = getPackProgress(pack);
    
    // Check each step in order
    if (progress.programmeStatus !== 'done') return { step: 3, name: 'Programme' };
    if (progress.planStatus !== 'done') return { step: 4, name: 'Plan' };
    if (progress.presenceStatus !== 'done') return { step: 5, name: 'Présence' };
    if (progress.evaluationStatus !== 'done') return { step: 6, name: 'Évaluation' };
    
    // All done
    return null;
  };

 const handleEditPack = (pack) => {
  if (!pack.form_data) {
    alert('⚠️ This pack does not have editable data');
    return;
  }

  const nextStep = getNextIncompleteStep(pack);
  
  if (!nextStep) {
    alert('✅ This formation pack is complete! All fiches are marked as done.');
    return;
  }

  // IMPORTANT: Restore ALL form data including nested objects
  setFormData({
    ...pack.form_data,
    currentPackId: pack.id,
    packUniqueId: pack.pack_unique_id,
    // Ensure presence data is restored
    presenceData: pack.form_data.presenceData || null,
    // Ensure plan data is restored
    planData: pack.form_data.planData || null,
    // Ensure evaluation data is restored
    evaluationData: pack.form_data.evaluationData || null,
    // Ensure all other critical data is restored
    selectedClientId: pack.form_data.selectedClientId || pack.client_id,
    clientName: pack.form_data.clientName || pack.clients?.name,
    interventionType: pack.form_data.interventionType || 'formation',
    selectedFormations: pack.form_data.selectedFormations || [],
    formationsData: pack.form_data.formationsData || {}
  });
  
  setCurrentStep(nextStep.step);
  navigate('/create');
};
  const handleEditLicense = (fiche) => {
    if (!fiche.form_data) {
      alert('⚠️ This fiche does not have editable data');
      return;
    }

    setFormData(fiche.form_data);
    setCurrentStep(1);
    navigate('/create');
  };

  const handleDownloadPackZip = async (pack) => {
    try {
      const zip = new JSZip();
      const folder = zip.folder(`Formation_Pack_${pack.pack_unique_id}`);
      
      const allPdfs = await getAllPDFs();
      const packPdfs = allPdfs.filter(pdf => pdf.pack_id === pack.id);
      
      if (packPdfs.length === 0) {
        alert('No PDFs found in this pack');
        return;
      }

      for (const pdf of packPdfs) {
        try {
          const response = await fetch(pdf.publicUrl);
          const blob = await response.blob();
          folder.file(pdf.filename, blob);
        } catch (error) {
          console.error(`Error downloading ${pdf.filename}:`, error);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `Formation_Pack_${pack.pack_unique_id}.zip`);
      
    } catch (error) {
      console.error('Error creating ZIP:', error);
      alert('Error creating ZIP: ' + error.message);
    }
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

  const getPackProgress = (pack) => {
    return {
      programmeStatus: pack.programme_status || 'not_started',
      planStatus: pack.plan_status || 'not_started',
      presenceStatus: pack.presence_status || 'not_started',
      evaluationStatus: pack.evaluation_status || 'not_started',
      overallStatus: pack.status
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'done':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-yellow-600" />;
      case 'refused':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'refused':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const FormationPackCard = ({ pack }) => {
    const progress = getPackProgress(pack);
    const steps = [
      { key: 'programme', label: 'Programme', icon: '📋', status: progress.programmeStatus },
      { key: 'plan', label: 'Plan', icon: '📅', status: progress.planStatus },
      { key: 'presence', label: 'Présence', icon: '✍️', status: progress.presenceStatus },
      { key: 'evaluation', label: 'Évaluation', icon: '📊', status: progress.evaluationStatus }
    ];
    
    const completedCount = steps.filter(step => step.status === 'done').length;
    const isComplete = progress.overallStatus === 'completed';

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
        {/* Card Header */}
        <div 
          className="p-3 sm:p-4 rounded-t-xl text-white"
          style={{ backgroundColor: isComplete ? '#10b981' : ABBK_COLORS.red }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase flex items-center gap-2">
              <Package size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Pack #{pack.pack_unique_id || pack.id}</span>
              <span className="sm:hidden">#{pack.pack_unique_id || pack.id}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                {completedCount}/4
              </span>
              {isComplete && <Lock size={14} />}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate font-semibold">
                {pack.clients?.name || 'Unknown Client'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {pack.clients?.client_id || 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs">{formatDate(pack.created_at)}</span>
            </div>
          </div>

          {/* Progress Status */}
          <div className="pt-2 sm:pt-3 border-t dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Progress
              </p>
              <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(progress.overallStatus)}`}>
                {progress.overallStatus === 'completed' ? 'Complete' : 'In Progress'}
              </span>
            </div>
            
            <div className="space-y-2">
              {steps.map((step) => (
                <div key={step.key} className="flex items-center gap-2">
                  {getStatusIcon(step.status)}
                  <span className="text-xs flex-1">{step.icon} {step.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(step.status)}`}>
                    {step.status === 'done' ? '✓' : 
                     step.status === 'in_progress' ? '...' : 
                     step.status === 'refused' ? '✗' : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card Footer - Actions */}
        <div className="p-3 sm:p-4 border-t dark:border-gray-700 flex flex-wrap gap-2">
          <button
            onClick={() => handleEditPack(pack)}
            disabled={isComplete}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition text-xs sm:text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: isComplete ? ABBK_COLORS.gray : ABBK_COLORS.red }}
            title={isComplete ? "Pack is complete" : "Continue editing pack"}
          >
            <Edit size={14} className="sm:w-4 sm:h-4" />
            <span>{isComplete ? 'Complete' : 'Continue'}</span>
          </button>

          {completedCount > 0 && (
            <button
              onClick={() => handleDownloadPackZip(pack)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm shadow-md"
              title="Download all PDFs as ZIP"
            >
              <Download size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">ZIP</span>
            </button>
          )}
          
          <button
            onClick={() => handleDeletePack(pack.id)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
            title="Delete entire pack"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    );
  };

  const LicenseCard = ({ fiche }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
        <div 
          className="p-3 sm:p-4 rounded-t-xl text-white"
          style={{ backgroundColor: ABBK_COLORS.darkred }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold uppercase">
              🔧 License
            </span>
            <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded truncate max-w-[150px]">
              {fiche.filename?.split('.')[0]?.substring(0, 15) || 'PDF'}
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <User size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate font-semibold">
                {fiche.clients?.name || 'Unknown Client'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">
                {fiche.clients?.client_id || 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar size={14} className="sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs">{formatDate(fiche.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-4 border-t dark:border-gray-700 flex flex-wrap gap-2">
          <button
            onClick={() => handleEditLicense(fiche)}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg transition text-xs sm:text-sm shadow-md"
            style={{ backgroundColor: ABBK_COLORS.red }}
          >
            <Edit size={14} className="sm:w-4 sm:h-4" />
            <span>Edit</span>
          </button>

          <a
            href={fiche.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 text-white rounded-lg transition text-xs sm:text-sm shadow-md"
            style={{ backgroundColor: ABBK_COLORS.black }}
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">View</span>
          </a>
          
          <a
            href={fiche.publicUrl}
            download
            className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm shadow-md"
          >
            <Download size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">DL</span>
          </a>
          
          <button
            onClick={() => handleDeleteLicense(fiche.id)}
            className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs sm:text-sm"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            Saved Fiches
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            {formationPacks.length} pack(s) • {licenseFiches.length} license(s)
          </p>
        </div>
        
        <button
          onClick={loadData}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg transition disabled:opacity-50 shadow-md text-sm sm:text-base"
          style={{ backgroundColor: ABBK_COLORS.red }}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-6 transition-colors duration-300">
        <div className="flex flex-col gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by client name, ID, or pack name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter size={18} className="text-gray-400 flex-shrink-0" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Types</option>
                <option value="formation">Formation Packs Only</option>
                <option value="license">Licenses Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <Filter size={18} className="text-gray-400 flex-shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw size={40} className="sm:w-12 sm:h-12 animate-spin mx-auto mb-4" style={{ color: ABBK_COLORS.red }} />
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Loading...</p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 sm:p-12 text-center">
          <FileText size={48} className="sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-2">No items found</p>
          <p className="text-sm sm:text-base text-gray-400 dark:text-gray-500">
            {searchTerm || filterType !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters' 
              : 'Create your first fiche to get started!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            item.itemType === 'pack' ? (
              <FormationPackCard key={`pack-${item.id}`} pack={item} />
            ) : (
              <LicenseCard key={`license-${item.id}`} fiche={item} />
            )
          ))}
        </div>
      )}
    </div>
  );
}