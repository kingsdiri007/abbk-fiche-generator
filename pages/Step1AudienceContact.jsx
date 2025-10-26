import React, { useState, useEffect } from 'react';
import { useFormContext } from '../context/FormContext';
import { getAllClients, addClient, searchClients } from '../services/supabaseService';
import { Search, Plus, X } from 'lucide-react';

export default function Step1AudienceContact() {
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

  // Load clients from Supabase on mount
  useEffect(() => {
    loadClients();
  }, []);

  // Filter clients when search term changes
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
      alert('Please fill in Name and Matricule Fiscal');
      return;
    }

    try {
      const addedClient = await addClient(newClient);
      
      // Refresh client list
      await loadClients();
      
      // Auto-select the new client
      updateFormData({
        selectedClientId: addedClient.id,
        clientName: addedClient.name,
        address: addedClient.address,
        phone: addedClient.phone,
        id: addedClient.client_id,
        matriculeFiscal: addedClient.matricule_fiscal
      });

      // Reset form
      setNewClient({ name: '', address: '', phone: '', matricule_fiscal: '' });
      setShowAddClient(false);
      alert('✅ Client added successfully!');
    } catch (error) {
      console.error('Error adding client:', error);
      alert('Error adding client: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center justify-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">CLIENT SELECTION</h2>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Side - Actions */}
          <div className="col-span-4 space-y-4">
            {/* Search by ID or Name */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ID or Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Add Client Button */}
            <button
              onClick={() => setShowAddClient(!showAddClient)}
              className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus size={20} />
              Add New Client
            </button>

            {/* Add Client Form */}
            {showAddClient && (
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">New Client</h3>
                  <button onClick={() => setShowAddClient(false)}>
                    <X size={20} className="text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Company Name *"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Matricule Fiscal *"
                    value={newClient.matricule_fiscal}
                    onChange={(e) => setNewClient({ ...newClient, matricule_fiscal: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddClient}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Add Client
                  </button>
                </div>
              </div>
            )}

            {searchTerm && (
              <p className="text-sm text-gray-600">
                Found {filteredClients.length} client(s)
              </p>
            )}
          </div>

          {/* Right Side - Contact Information */}
          <div className="col-span-8">
            <h3 className="text-xl font-bold text-gray-400 mb-6">Contact Information</h3>
            
            <div className="space-y-4">
              {/* Client Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client: *
                </label>
                <select
                  value={formData.selectedClientId || ''}
                  onChange={handleClientSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select a client --</option>
                  {filteredClients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.client_id} - {client.name}
                    </option>
                  ))}
                </select>
                {filteredClients.length === 0 && searchTerm && (
                  <p className="text-sm text-red-600 mt-1">No clients found matching: {searchTerm}</p>
                )}
              </div>

              {/* Auto-filled Contact Info */}
              {formData.selectedClientId && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name:
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matricule Fiscal:
                    </label>
                    <input
                      type="text"
                      value={formData.matriculeFiscal}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address:
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone:
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client ID:
                      </label>
                      <input
                        type="text"
                        value={formData.id}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {!formData.selectedClientId && (
                <div className="flex items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center">
                    <Search size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">Select a client to continue</p>
                    <p className="text-sm">Search by ID/Name or add a new client</p>
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