import React, { useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { getAllClients, addClient, searchClients } from '../services/supabaseService';
import { Search, Plus, X } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function Step1AudienceContact() {
  const { t } = useLanguage();
  const { formData, updateFormData } = useFormContext();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newClient, setNewClient] = useState({
    name: '',
    address: '',
    phone: '',
    matricule_fiscal: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      handleSearch();
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await getAllClients();
      setClients(data);
      setFilteredClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      alert('Error loading clients: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await searchClients(searchTerm);
      setFilteredClients(results);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);
    
    if (client) {
      updateFormData({
        selectedClientId: client.id,
        clientName: client.name,
        address: client.address,
        phone: client.phone,
        id: client.client_id,
        matriculeFiscal: client.matricule_fiscal
      });
    } else {
      updateFormData({
        selectedClientId: null,
        clientName: '',
        address: '',
        phone: '',
        id: '',
        matriculeFiscal: ''
      });
    }
  };

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.matricule_fiscal) {
      alert(t('step1.fillRequired') || 'Please fill in Name and Matricule Fiscal');
      return;
    }

    try {
      const addedClient = await addClient(newClient);
      await loadClients();
      
      updateFormData({
        selectedClientId: addedClient.id,
        clientName: addedClient.name,
        address: addedClient.address,
        phone: addedClient.phone,
        id: addedClient.client_id,
        matriculeFiscal: addedClient.matricule_fiscal
      });

      setNewClient({ name: '', address: '', phone: '', matricule_fiscal: '' });
      setShowAddClient(false);
      alert(t('step1.clientAdded') || '✅ Client added successfully!');
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex items-center justify-center transition-colors duration-300" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ABBK_COLORS.red }}></div>
            <p className="text-gray-600 dark:text-gray-400">{t('step1.loading') || 'Loading clients...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{t('step1.title')}</h2>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Side - Actions */}
          <div className="col-span-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t('step1.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 transition-colors duration-300"
                style={{ focusRingColor: ABBK_COLORS.red }}
              />
            </div>

            {/* Add Client Button */}
            <button
              onClick={() => setShowAddClient(!showAddClient)}
              className="w-full flex items-center justify-center gap-2 p-4 text-white rounded-lg transition shadow-md"
              style={{ backgroundColor: ABBK_COLORS.red }}
              onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
              onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
            >
              <Plus size={20} />
              {t('step1.addClient')}
            </button>

            {/* Add Client Form */}
            {showAddClient && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-2 transition-colors duration-300" style={{ borderColor: ABBK_COLORS.red + '40' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 dark:text-white">{t('step1.newClient')}</h3>
                  <button onClick={() => setShowAddClient(false)}>
                    <X size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={t('step1.companyName') + ' *'}
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                  />
                  <input
                    type="text"
                    placeholder={t('step1.matriculeFiscal') + ' *'}
                    value={newClient.matricule_fiscal}
                    onChange={(e) => setNewClient({ ...newClient, matricule_fiscal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                  />
                  <input
                    type="text"
                    placeholder={t('step1.address')}
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                  />
                  <input
                    type="text"
                    placeholder={t('step1.phone')}
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                  />
                  <button
                    onClick={handleAddClient}
                    className="w-full px-4 py-2 text-white rounded-lg text-sm transition shadow-md"
                    style={{ backgroundColor: ABBK_COLORS.red }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
                    onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
                  >
                    {t('step1.addClient')}
                  </button>
                </div>
              </div>
            )}

            {searchTerm && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredClients.length} {t('step1.clientsFound')}
              </p>
            )}
          </div>

          {/* Right Side - Contact Information */}
          <div className="col-span-8">
            <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-6">{t('step1.contactInfo')}</h3>
            
            <div className="space-y-4">
              {/* Client Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('step1.selectClient')} *
                </label>
                <select
                  value={formData.selectedClientId || ''}
                  onChange={handleClientSelect}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:border-transparent transition-colors duration-300"
                  style={{ focusRingColor: ABBK_COLORS.red }}
                >
                  <option value="">{t('step1.selectPlaceholder')}</option>
                  {filteredClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.client_id} - {client.name}
                    </option>
                  ))}
                </select>
                {filteredClients.length === 0 && searchTerm && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {t('step1.noClientsFound') || 'No clients found matching:'} {searchTerm}
                  </p>
                )}
              </div>

              {/* Auto-filled Contact Info */}
              {formData.selectedClientId && (
                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 transition-colors duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('step1.clientName')}
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-semibold transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('step1.matriculeFiscal')}
                    </label>
                    <input
                      type="text"
                      value={formData.matriculeFiscal}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white transition-colors duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('step1.address')}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white transition-colors duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('step1.phone')}
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('step1.clientId')}
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white transition-colors duration-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!formData.selectedClientId && (
                <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-300">
                  <div className="text-center">
                    <Search size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg mb-2">{t('step1.selectToContinue')}</p>
                    <p className="text-sm">{t('step1.searchOrAdd')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}