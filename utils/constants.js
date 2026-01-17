import { FORMATION_TEMPLATES } from './formationTemplates';

export { FORMATION_TEMPLATES };

export const INITIAL_FORM_DATA = {
  // Type selection (Educational/Industrial)
  audienceType: '',
  
  // Client information
  selectedClientId: null,
  clientName: '',
  address: '',
  phone: '',
  id: '',
  
  // Intervention type
  interventionType: '',
  
  // Formation: Multiple formations (changed from certifications)
  selectedFormations: [], // Array of formation IDs
  formationsData: {}, // { 'solidworks-3d': { formationName, ref, schedule, ... }, ... }
  
  // License: License table
  licenses: [{ name: '', quantity: '', serial: '', invoice: '' }],
  
  // Common details
  interventionNature: '',
  referenceBC: '',
  intervenant: '',
  interventionDate: '',
  observations: '',
  location: ''
};