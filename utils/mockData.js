import { getAllClients, searchClients, addClient as addClientToSupabase} from '../services/supabaseService';

export let MOCK_CLIENTS = [];

// Initialize clients from Supabase
export const initializeClients = async () => {
  try {
    MOCK_CLIENTS = await getAllClients();
    return MOCK_CLIENTS;
  } catch (error) {
    console.error('Error loading clients:', error);
    return [];
  }
};


// Helper function to generate nature of intervention text
export function generateInterventionNature(licenses, clientName) {
  const licenseGroups = {};
  licenses.forEach(license => {
    if (license.name) {
      if (!licenseGroups[license.name]) {
        licenseGroups[license.name] = 0;
      }
      licenseGroups[license.name] += parseInt(license.quantity) || 1;
    }
  });

  const parts = Object.entries(licenseGroups).map(([name, quantity]) => 
     `${quantity} licence${quantity > 1 ? 's' : ''} ${name}`
  );

  return `Installation de `+parts.join(' et ') + ` pour la Société ${clientName || ''}`;
}

// Add new client (now uses Supabase)
export async function addNewClient(clientData) {
  try {
    const newClient = await addClientToSupabase(clientData);
    MOCK_CLIENTS.push(newClient);
    return newClient;
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
}

// Search clients by ID or name (now uses Supabase)
export async function searchClientById(searchId) {
  try {
    return await searchClients(searchId);
  } catch (error) {
    console.error('Error searching clients:', error);
    return [];
  }
}