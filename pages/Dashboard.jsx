import React, { useEffect, useState } from 'react';
import { 
  Package, User, Calendar, Eye, Edit, Trash2, 
  Search, Filter, RefreshCw, ChevronDown, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllFormationPacks, deleteFormationPack } from '../services/supabaseService';
import { useFormContext } from '../context/FormContext';
import { ABBK_COLORS } from '../utils/theme';
import { ProtectedContent } from '../components/ProtectedContent';

export default function Dashboard() {
  const navigate = useNavigate();
  const { setFormData, setCurrentStep } = useFormContext();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const data = await getAllFormationPacks();
      setPacks(data);
    } catch (error) {
      console.error('Error loading packs:', error);
      alert('Error loading packs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine which column a pack belongs to
  const getPackColumn = (pack) => {
    const progress = {
      programme: pack.programme_status || 'not_started',
      plan: pack.plan_status || 'not_started',
      presence: pack.presence_status || 'not_started',
      evaluation: pack.evaluation_status || 'not_started'
    };

    // If all done -> Done column
    if (progress.programme === 'done' && 
        progress.plan === 'done' && 
        progress.presence === 'done' && 
        progress.evaluation === 'done') {
      return 'done';
    }

    // If evaluation in progress or done but not all done -> Evaluation
    if (progress.evaluation === 'in_progress' || progress.evaluation === 'done') {
      return 'evaluation';
    }

    // If presence in progress or done -> Presence
    if (progress.presence === 'in_progress' || progress.presence === 'done') {
      return 'presence';
    }

    // If plan in progress or done -> Plan
    if (progress.plan === 'in_progress' || progress.plan === 'done') {
      return 'plan';
    }

    // Default to programme
    return 'programme';
  };

  // Filter packs
  const getFilteredPacks = () => {
    let filtered = [...packs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pack => {
        const search = searchTerm.toLowerCase();
        return (
          pack.pack_name?.toLowerCase().includes(search) ||
          pack.pack_unique_id?.toLowerCase().includes(search) ||
          pack.clients?.name?.toLowerCase().includes(search) ||
          pack.clients?.client_id?.toLowerCase().includes(search)
        );
      });
    }

    // Client filter
    if (selectedClient !== 'all') {
      filtered = filtered.filter(pack => pack.client_id === selectedClient);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(pack => {
        const packDate = new Date(pack.created_at);
        const diffDays = Math.floor((now - packDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return diffDays === 0;
        if (dateFilter === 'week') return diffDays <= 7;
        if (dateFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    return filtered;
  };

  // Group packs by column
  const groupPacksByColumn = () => {
    const filtered = getFilteredPacks();
    return {
      programme: filtered.filter(p => getPackColumn(p) === 'programme'),
      plan: filtered.filter(p => getPackColumn(p) === 'plan'),
      presence: filtered.filter(p => getPackColumn(p) === 'presence'),
      evaluation: filtered.filter(p => getPackColumn(p) === 'evaluation'),
      done: filtered.filter(p => getPackColumn(p) === 'done')
    };
  };

  const handleViewPack = (pack) => {
    // Navigate to saved page or show details
    navigate('/saved');
  };

  const handleEditPack = (pack) => {
    if (!pack.form_data) {
      alert('⚠️ This pack does not have editable data');
      return;
    }

    const nextStep = getNextIncompleteStep(pack);
    
    if (!nextStep) {
      alert('✅ This formation pack is complete!');
      return;
    }

    setFormData({
      ...pack.form_data,
      currentPackId: pack.id,
      packUniqueId: pack.pack_unique_id
    });
    
    setCurrentStep(nextStep.step);
    navigate('/create');
  };

  const getNextIncompleteStep = (pack) => {
    if (pack.programme_status !== 'done') return { step: 3, name: 'Programme' };
    if (pack.plan_status !== 'done') return { step: 4, name: 'Plan' };
    if (pack.presence_status !== 'done') return { step: 5, name: 'Présence' };
    if (pack.evaluation_status !== 'done') return { step: 6, name: 'Évaluation' };
    return null;
  };

  const handleDeletePack = async (pack) => {
    if (!window.confirm(`⚠️ Delete pack #${pack.pack_unique_id || pack.id}? This will delete ALL PDFs.`)) {
      return;
    }

    try {
      await deleteFormationPack(pack.id);
      alert('✅ Pack deleted successfully!');
      loadPacks();
    } catch (error) {
      console.error('Error deleting pack:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const columns = [
    { id: 'programme', title: 'Programme', icon: '📋', color: '#E63946' },
    { id: 'plan', title: 'Plan', icon: '📅', color: '#E63946' },
    { id: 'presence', title: 'Présence', icon: '✍️', color: '#E63946' },
    { id: 'evaluation', title: 'Évaluation', icon: '📊', color: '#E63946' },
    { id: 'done', title: 'Done', icon: '✅', color: '#10b981' }
  ];

  const groupedPacks = groupPacksByColumn();
  const uniqueClients = [...new Set(packs.map(p => p.clients).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4"
            style={{ borderColor: ABBK_COLORS.red }}
          ></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
     <ProtectedContent 
          requiredRole="admin"
          showMessage={true}
        > 
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Title Section */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Formation Packs Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {packs.length} total packs • {groupedPacks.done.length} completed
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={loadPacks}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 text-sm font-medium"
                style={{ backgroundColor: ABBK_COLORS.red }}
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search packs, clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Client Filter */}
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Clients</option>
                  {uniqueClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>

                {/* Date Filter */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedClient !== 'all' || dateFilter !== 'all') && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Active Filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
                      Search: {searchTerm}
                      <X size={12} className="cursor-pointer" onClick={() => setSearchTerm('')} />
                    </span>
                  )}
                  {selectedClient !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                      Client
                      <X size={12} className="cursor-pointer" onClick={() => setSelectedClient('all')} />
                    </span>
                  )}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                      {dateFilter}
                      <X size={12} className="cursor-pointer" onClick={() => setDateFilter('all')} />
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <div 
                className="rounded-t-xl p-4 text-white shadow-md"
                style={{ backgroundColor: column.color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{column.icon}</span>
                    <h3 className="font-bold text-lg">{column.title}</h3>
                  </div>
                  <span className="bg-white bg-opacity-30 px-2.5 py-1 rounded-full text-sm font-semibold">
                    {groupedPacks[column.id].length}
                  </span>
                </div>
              </div>

              {/* Column Body */}
              <div 
                className="bg-gray-100 dark:bg-gray-800 rounded-b-xl p-3 min-h-[500px] space-y-3"
                style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
              >
                {groupedPacks[column.id].length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                    <Package size={40} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No packs</p>
                  </div>
                ) : (
                  groupedPacks[column.id].map(pack => (
                    <PackCard 
                      key={pack.id}
                      pack={pack}
                      onView={handleViewPack}
                      onEdit={handleEditPack}
                      onDelete={handleDeletePack}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </ProtectedContent>
  );
  
}

// Pack Card Component
function PackCard({ pack, onView, onEdit, onDelete, formatDate }) {
  return (
    <ProtectedContent 
      requiredRole="admin"
      showMessage={true}
    > 
    <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all p-4 border-l-4" style={{ borderColor: ABBK_COLORS.red }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} style={{ color: ABBK_COLORS.red }} />
            <span className="font-bold text-gray-900 dark:text-white text-sm">
              Pack #{pack.pack_unique_id || pack.id}
            </span>
          </div>
          <h4 className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {pack.pack_name}
          </h4>
        </div>
      </div>

      {/* Client Info */}
      <div className="space-y-2 mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 text-xs">
          <User size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300 truncate">
            {pack.clients?.name || 'Unknown Client'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Calendar size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300">
            {formatDate(pack.created_at)}
          </span>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {[
          { status: pack.programme_status, icon: '📋' },
          { status: pack.plan_status, icon: '📅' },
          { status: pack.presence_status, icon: '✍️' },
          { status: pack.evaluation_status, icon: '📊' }
        ].map((item, idx) => (
          <div 
            key={idx}
            className={`h-2 rounded-full ${
              item.status === 'done' ? 'bg-green-500' :
              item.status === 'in_progress' ? 'bg-yellow-500' :
              'bg-gray-300 dark:bg-gray-600'
            }`}
            title={item.icon}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(pack)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-white rounded-md hover:opacity-90 transition text-xs font-medium"
          style={{ backgroundColor: ABBK_COLORS.red }}
        >
          <Edit size={14} />
          Edit
        </button>
        <button
          onClick={() => onView(pack)}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition text-xs font-medium"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={() => onDelete(pack)}
          className="flex items-center justify-center gap-1 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition text-xs font-medium"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
    </ProtectedContent>
  );
}