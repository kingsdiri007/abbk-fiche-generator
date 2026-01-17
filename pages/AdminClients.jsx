import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Save, X, Search, User, Building2,
  AlertCircle, RefreshCw, Phone, MapPin, FileText
} from 'lucide-react';
import { 
  getAllClients, 
  addClient, 
  updateClient, 
  deleteClient
} from '../services/supabaseService';
import { ProtectedContent } from '../components/ProtectedContent';
import { ABBK_COLORS } from '../utils/theme';

// Move ClientModal OUTSIDE the main component
const ClientModal = ({ isEdit, formData, setFormData, onSave, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Client' : 'Add New Client'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Client ID {!isEdit && '*'}
          </label>
          <input
            type="text"
            value={formData.id_client}
            onChange={(e) => setFormData({ ...formData, id_client: e.target.value })}
            disabled={isEdit}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
            placeholder="CLI-IND-001"
          />
          {isEdit && (
            <p className="text-xs text-gray-500 mt-1">Client ID cannot be changed</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Company Name Ltd."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Matricule Fiscal (Tax ID) *
          </label>
          <input
            type="text"
            value={formData.matricule_fiscal}
            onChange={(e) => setFormData({ ...formData, matricule_fiscal: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="1234567/A/M/000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Street, City, Country"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Company Phone
            </label>
            <input
              type="tel"
              value={formData.company_phone}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="+216 XX XXX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Contact Phone
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="+216 XX XXX XXX"
            />
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
          {isEdit ? 'Update' : 'Create'} Client
        </button>
      </div>
    </div>
  </div>
);

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState(getEmptyClient());

  function getEmptyClient() {
    return {
      id_client: '',
      name: '',
      address: '',
      company_phone: '',
      contact_phone: '',
      matricule_fiscal: ''
    };
  }

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Error loading clients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(getEmptyClient());
    setShowAddModal(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setFormData({
      id_client: client.id_client,
      name: client.name,
      address: client.address,
      company_phone: client.company_phone || '',
      contact_phone: client.contact_phone || '',
      matricule_fiscal: client.matricule_fiscal
    });
    setShowEditModal(true);
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteClient(clientId);
      await loadClients();
      alert('✅ Client deleted successfully!');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('❌ Error deleting client: ' + error.message);
    }
  };

  const handleSaveAdd = async () => {
    if (!formData.name || !formData.matricule_fiscal) {
      alert('Please fill in Name and Tax ID (Matricule Fiscal)');
      return;
    }

    try {
      await addClient(formData);
      await loadClients();
      setShowAddModal(false);
      alert('✅ Client added successfully!');
    } catch (error) {
      console.error('Error adding client:', error);
      alert('❌ Error adding client: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.name || !formData.matricule_fiscal) {
      alert('Please fill in Name and Tax ID (Matricule Fiscal)');
      return;
    }

    try {
      await updateClient(selectedClient.id, formData);
      await loadClients();
      setShowEditModal(false);
      alert('✅ Client updated successfully!');
    } catch (error) {
      console.error('Error updating client:', error);
      alert('❌ Error updating client: ' + error.message);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id_client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.matricule_fiscal && c.matricule_fiscal.toLowerCase().includes(searchTerm.toLowerCase()))
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
                  <Building2 size={24} style={{ color: ABBK_COLORS.red }} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Clients Management
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {clients.length} total clients
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadClients}
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
                  Add Client
                </button>
              </div>
            </div>

            <div className="mt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, ID, or tax number..."
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
          ) : filteredClients.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg text-gray-600 dark:text-gray-400">No clients found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredClients.map(client => (
                <div key={client.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {client.id_client}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {client.matricule_fiscal && (
                        <div className="flex items-start gap-2">
                          <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Tax ID:</span>
                            <p className="text-gray-600 dark:text-gray-400">{client.matricule_fiscal}</p>
                          </div>
                        </div>
                      )}
                      
                      {client.address && (
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Address:</span>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{client.address}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <Phone size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span>
                          <p className="text-gray-600 dark:text-gray-400">
                            {client.company_phone || client.contact_phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => handleEdit(client)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
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
            <ClientModal
              isEdit={false}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSaveAdd}
              onClose={() => setShowAddModal(false)}
            />
          )}

          {showEditModal && (
            <ClientModal
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