import React, { useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { getAllClients, addClient, searchClients, updateClient } from '../services/supabaseService';
import { Search, Plus, X, Save, Edit2 } from 'lucide-react';
import { ABBK_COLORS } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function Step1AudienceContact() {
  const { t } = useLanguage();
  const { formData, updateFormData, showToast } = useFormContext();
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showAddClient, setShowAddClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClientData, setEditedClientData] = useState({});
  const [newClient, setNewClient] = useState({
    id_client: '',
    name: '',
    address: '',
    company_phone: '',
    contact_phone: '',
    matricule_fiscal: ''
  });

  useEffect(() => {
    loadClients();
    // Set default date to today
    if (!formData.interventionDate) {
      const today = new Date().toISOString().split('T')[0];
      updateFormData({ interventionDate: today });
    }
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
      showToast?.('Error loading clients: ' + error.message, 'error');
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
  const selectedValue = e.target.value;
  console.log('Selected value:', selectedValue); // Debug log
  
  // Find client by id_client (which is now the value in the select)
  const client = clients.find(c => c.id_client === selectedValue);
  
  console.log('Found client:', client); // Debug log
  
  if (client) {
    const newFormData = {
      selectedClientId: client.id_client, // Use id_client as the identifier
      clientName: client.name || '',
      address: client.address || '',
      companyPhone: client.company_phone || '',
      contactPhone: client.contact_phone || '',
      phone: client.company_phone || client.contact_phone || '',
      id: client.id_client || '',
      matriculeFiscal: client.matricule_fiscal || ''
    };
    
    console.log('Updating form data with:', newFormData); // Debug log
    updateFormData(newFormData);
    
    // Initialize edited data
    setEditedClientData({
      name: client.name || '',
      address: client.address || '',
      companyPhone: client.company_phone || '',
      contactPhone: client.contact_phone || '',
      matriculeFiscal: client.matricule_fiscal || ''
    });
    
    setIsEditing(false);
  } else {
    console.log('No client found, clearing form'); // Debug log
    updateFormData({
      selectedClientId: null,
      clientName: '',
      address: '',
      companyPhone: '',
      contactPhone: '',
      phone: '',
      id_client: '',
      matriculeFiscal: ''
    });
    setEditedClientData({});
    setIsEditing(false);
  }
};


  const checkClientNameExists = (name) => {
    return clients.some(client => 
      client.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
  };

  const checkClientIdExists = (clientId) => {
    return clients.some(client => 
      client.id_client.toLowerCase().trim() === clientId.toLowerCase().trim()
    );
  };

  const handleAddClient = async () => {
    // Validation
    if (!newClient.id_client || !newClient.name || !newClient.matricule_fiscal) {
      showToast?.('Please fill in Client ID, Company Name, and Tax ID', 'error');
      return;
    }

    // Check if client ID already exists
    if (checkClientIdExists(newClient.id_client)) {
      showToast?.(`Client ID "${newClient.id_client}" already exists. Please use a different ID.`, 'error');
      return;
    }

    // Check if name already exists
    if (checkClientNameExists(newClient.name)) {
      showToast?.(`Company name "${newClient.name}" already exists. Please use a different name.`, 'error');
      return;
    }

    try {
      const clientData = {
        id_client: newClient.id_client.trim(),
        name: newClient.name.trim(),
        address: newClient.address.trim(),
        company_phone: newClient.company_phone.trim(),
        contact_phone: newClient.contact_phone.trim(),
        matricule_fiscal: newClient.matricule_fiscal.trim()
      };

      const addedClient = await addClient(clientData);
      await loadClients();
      
      updateFormData({
        selectedClientId: addedClient.id,
        clientName: addedClient.name,
        address: addedClient.address,
        companyPhone: addedClient.company_phone || '',
        contactPhone: addedClient.contact_phone || '',
        phone: addedClient.company_phone || addedClient.contact_phone || '',
        id: addedClient.id_client,
        matriculeFiscal: addedClient.matricule_fiscal
      });

      setNewClient({ 
        id_client: '',
        name: '', 
        address: '', 
        company_phone: '', 
        contact_phone: '',
        matricule_fiscal: '' 
      });
      setShowAddClient(false);
      showToast?.('✅ Client added successfully!', 'success');
    } catch (error) {
      console.error('Error adding client:', error);
      showToast?.('Error adding client: ' + error.message, 'error');
    }
  };

  const handleEditToggle = () => {
    if (!formData.selectedClientId) return;
    
    if (!isEditing) {
      // Entering edit mode
      setEditedClientData({
        name: formData.clientName,
        address: formData.address,
        companyPhone: formData.companyPhone || '',
        contactPhone: formData.contactPhone || '',
        matriculeFiscal: formData.matriculeFiscal
      });
    }
    
    setIsEditing(!isEditing);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset edited data to original
    const client = clients.find(c => c.id === formData.selectedClientId);
    if (client) {
      setEditedClientData({
        name: client.name,
        address: client.address,
        companyPhone: client.company_phone || '',
        contactPhone: client.contact_phone || '',
        matriculeFiscal: client.matricule_fiscal
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!formData.selectedClientId) return;

    // Validation
    if (!editedClientData.name || !editedClientData.matriculeFiscal) {
      showToast?.('Company Name and Tax ID are required', 'error');
      return;
    }

    // Check if name changed and if new name already exists
    const currentClient = clients.find(c => c.id === formData.selectedClientId);
    if (currentClient.name !== editedClientData.name && checkClientNameExists(editedClientData.name)) {
      showToast?.(`Company name "${editedClientData.name}" already exists. Please use a different name.`, 'error');
      return;
    }

    try {
      const updatedData = {
        name: editedClientData.name.trim(),
        address: editedClientData.address.trim(),
        company_phone: editedClientData.companyPhone.trim(),
        contact_phone: editedClientData.contactPhone.trim(),
        matricule_fiscal: editedClientData.matriculeFiscal.trim()
      };

      await updateClient(formData.selectedClientId, updatedData);
      await loadClients();
      
      // Update form data
      updateFormData({
        clientName: editedClientData.name,
        address: editedClientData.address,
        companyPhone: editedClientData.companyPhone,
        contactPhone: editedClientData.contactPhone,
        phone: editedClientData.companyPhone || editedClientData.contactPhone,
        matriculeFiscal: editedClientData.matriculeFiscal
      });

      setIsEditing(false);
      showToast?.('✅ Client updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating client:', error);
      showToast?.('Error updating client: ' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 flex items-center justify-center transition-colors duration-300" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ABBK_COLORS.red }}></div>
            <p className="text-gray-600 dark:text-gray-400">{t('step1.loading') || 'Loading clients...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 transition-colors duration-300">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
          {t('step1.title')}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Left Side - Client Selection */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-700 dark:text-gray-300">
              {t('step1.selectClient')}
            </h3>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0" size={20} />
              <input
                type="text"
                placeholder={t('step1.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 transition-colors duration-300 text-sm sm:text-base"
                style={{ focusRingColor: ABBK_COLORS.red }}
              />
            </div>

            {/* Add Client Button */}
            <button
              onClick={() => setShowAddClient(!showAddClient)}
              className="w-full flex items-center justify-center gap-2 p-3 sm:p-4 text-white rounded-lg transition shadow-md text-sm sm:text-base"
              style={{ backgroundColor: ABBK_COLORS.red }}
              onMouseEnter={(e) => e.target.style.backgroundColor = ABBK_COLORS.darkred}
              onMouseLeave={(e) => e.target.style.backgroundColor = ABBK_COLORS.red}
            >
              <Plus size={20} />
              {t('step1.addClient')}
            </button>

            {/* Add Client Form */}
            {showAddClient && (
              <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg border-2 transition-colors duration-300" style={{ borderColor: ABBK_COLORS.red + '40' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">{t('step1.newClient')}</h3>
                  <button onClick={() => setShowAddClient(false)}>
                    <X size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Client ID (e.g., COMP-001) *"
                    value={newClient.id_client}
                    onChange={(e) => setNewClient({ ...newClient, id_client: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                  />
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
                    placeholder="Company Phone"
                    value={newClient.company_phone}
                    onChange={(e) => setNewClient({ ...newClient, company_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm transition-colors duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={newClient.contact_phone}
                    onChange={(e) => setNewClient({ ...newClient, contact_phone: e.target.value })}
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
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {filteredClients.length} {t('step1.clientsFound')}
              </p>
            )}
          </div>

          {/* Right Side - Client Info + Intervention Details */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-400 dark:text-gray-500">
                {t('step1.contactInfo')}
              </h3>
              
              {formData.selectedClientId && (
                <div className="flex gap-2">
                  {!isEditing ? (
                    <button
                      onClick={handleEditToggle}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        <Save size={16} />
                        Save
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Client Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('step1.selectClient')} *
                </label>
<select
  value={formData.selectedClientId || ''}
  onChange={handleClientSelect}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:border-transparent transition-colors duration-300 text-sm sm:text-base"
                  style={{ focusRingColor: ABBK_COLORS.red }}
                >
          <option value="">{t('step1.selectPlaceholder')}</option>
  {filteredClients.map(client => (
    <option key={client.id_client} value={client.id_client}>  {/* USE id_client */}
      {client.id_client} - {client.name}
    </option>
  ))}
</select>
              </div>

              {/* Auto-filled/Editable Contact Info */}
              {formData.selectedClientId && (
                <>
                  <div className="space-y-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700 transition-colors duration-300">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('step1.clientName')} {isEditing && '*'}
                      </label>
                      <input
                        type="text"
                        value={isEditing ? editedClientData.name : formData.clientName}
                        onChange={(e) => isEditing && setEditedClientData({...editedClientData, name: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                          isEditing 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                        } font-semibold transition-colors duration-300 text-sm sm:text-base`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('step1.address')}
                      </label>
                      <input
                        type="text"
                        value={isEditing ? editedClientData.address : formData.address}
                        onChange={(e) => isEditing && setEditedClientData({...editedClientData, address: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                          isEditing 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                        } transition-colors duration-300 text-sm sm:text-base`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Company Phone
                        </label>
                        <input
                          type="tel"
                          value={isEditing ? editedClientData.companyPhone : formData.companyPhone}
                          onChange={(e) => isEditing && setEditedClientData({...editedClientData, companyPhone: e.target.value})}
                          readOnly={!isEditing}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                            isEditing 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                          } transition-colors duration-300 text-sm sm:text-base`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={isEditing ? editedClientData.contactPhone : formData.contactPhone}
                          onChange={(e) => isEditing && setEditedClientData({...editedClientData, contactPhone: e.target.value})}
                          readOnly={!isEditing}
                          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                            isEditing 
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                          } transition-colors duration-300 text-sm sm:text-base`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('step1.matriculeFiscal')} {isEditing && '*'}
                      </label>
                      <input
                        type="text"
                        value={isEditing ? editedClientData.matriculeFiscal : formData.matriculeFiscal}
                        onChange={(e) => isEditing && setEditedClientData({...editedClientData, matriculeFiscal: e.target.value})}
                        readOnly={!isEditing}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg ${
                          isEditing 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'
                        } transition-colors duration-300 text-sm sm:text-base`}
                      />
                    </div>
                  </div>

                  {/* Intervention Details Section */}
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4">
                      Intervention Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Reference BC *
                          </label>
                          <input
                            type="text"
                            placeholder="Reference BC"
                            value={formData.referenceBC}
                            onChange={(e) => updateFormData({ referenceBC: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 transition-colors duration-300 text-sm sm:text-base"
                            style={{ focusRingColor: ABBK_COLORS.red }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={formData.interventionDate}
                            onChange={(e) => updateFormData({ interventionDate: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 transition-colors duration-300 text-sm sm:text-base"
                            style={{ focusRingColor: ABBK_COLORS.red }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location (Fait à) *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Ariana, Tunis"
                          value={formData.location}
                          onChange={(e) => updateFormData({ location: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 transition-colors duration-300 text-sm sm:text-base"
                          style={{ focusRingColor: ABBK_COLORS.red }}
                        />
                      </div>
                      {/* Intervention Type Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Intervention Type *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <button
                            onClick={() => updateFormData({ interventionType: 'formation' })}
                            className={`p-4 sm:p-6 rounded-xl text-center transition-all shadow ${
                              formData.interventionType === 'formation'
                                ? 'text-white scale-105'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                            style={formData.interventionType === 'formation' ? { 
                              backgroundColor: ABBK_COLORS.red,
                              boxShadow: `0 10px 15px -3px ${ABBK_COLORS.red}40`
                            } : {}}
                          >
                            <span className="text-2xl sm:text-3xl mb-2 block">📚</span>
                            <span className="text-base sm:text-lg font-semibold">Formation</span>
                          </button>

                          <button
                            onClick={() => updateFormData({ interventionType: 'license' })}
                            className={`p-4 sm:p-6 rounded-xl text-center transition-all shadow ${
                              formData.interventionType === 'license'
                                ? 'text-white scale-105'
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                            style={formData.interventionType === 'license' ? { 
                              backgroundColor: ABBK_COLORS.darkred,
                              boxShadow: `0 10px 15px -3px ${ABBK_COLORS.darkred}40`
                            } : {}}
                          >
                            <span className="text-2xl sm:text-3xl mb-2 block">🔧</span>
                            <span className="text-base sm:text-lg font-semibold">License</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!formData.selectedClientId && (
                <div className="flex items-center justify-center h-48 sm:h-64 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-300">
                  <div className="text-center px-4">
                    <Search size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-base sm:text-lg mb-2">{t('step1.selectToContinue')}</p>
                    <p className="text-xs sm:text-sm">{t('step1.searchOrAdd')}</p>
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