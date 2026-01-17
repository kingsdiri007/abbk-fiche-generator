// Formations are now loaded from Supabase
// This file is kept for backward compatibility

export const FORMATION_TEMPLATES = [];

export function createFormationFromTemplate(formationId) {
  // This function is deprecated - formations come from Supabase now
  return {
    formationName: '',
    formationRef: '',
    prerequisites: '',
    objectives: '',
    competencies: '',
    schedule: []
  };
}