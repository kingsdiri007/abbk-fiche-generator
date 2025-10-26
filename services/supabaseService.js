import { supabase } from '../supabase/client';

// ============================================
// AUTHENTICATION
// ============================================

export const signUp = async (email, password, name, role = 'normal') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// CLIENTS
// ============================================

export const getAllClients = async () => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const searchClients = async (searchTerm) => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .or(`client_id.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const addClient = async (clientData) => {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Generate client_id
  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });
  
  const clientId = `CLI-IND-${String((count || 0) + 1).padStart(3, '0')}`;
  
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      client_id: clientId,
      ...clientData,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateClient = async (id, clientData) => {
  const { data, error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteClient = async (id) => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============================================
// FORMATIONS
// ============================================

export const getAllFormations = async (software = null) => {
  let query = supabase
    .from('formations')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (software && software !== 'all') {
    query = query.eq('software', software);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
};

export const getFormationById = async (id) => {
  const { data, error } = await supabase
    .from('formations')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const addFormation = async (formationData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('formations')
    .insert([{
      ...formationData,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateFormation = async (id, formationData) => {
  const { data, error } = await supabase
    .from('formations')
    .update(formationData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteFormation = async (id) => {
  const { error } = await supabase
    .from('formations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const saveCustomFormation = async (originalId, formationData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const customId = `custom-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('formations')
    .insert([{
      formation_id: customId,
      ...formationData,
      is_custom: true,
      original_id: originalId,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============================================
// PDF STORAGE
// ============================================
export const uploadPDF = async (file, ficheType, clientId, formData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Generate unique filename (sanitize to remove special characters)
  const timestamp = Date.now();
  const sanitizedName = file.name
    .normalize('NFD') // Normalize accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_'); // Replace multiple underscores with single
  
  const filename = `${user.id}/${timestamp}-${sanitizedName}`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(filename, file);
  
  if (uploadError) throw uploadError;
  
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filename);
  
  const { data: pdfData, error: dbError } = await supabase
    .from('pdfs')
    .insert([{
      filename: file.name,
      original_name: file.name,
      storage_path: filename,
      size: file.size,
      fiche_type: ficheType,
      client_id: clientId,
      form_data: formData,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (dbError) throw dbError;
  
  return {
    ...pdfData,
    publicUrl
  };
};

export const checkIfAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  return profile?.role === 'admin';
};
// ============================================
// LICENSES
// ============================================

export const getAllLicenses = async () => {
  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
};

export const addLicense = async (licenseName, category = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('licenses')
    .insert([{
      name: licenseName,
      category,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteLicense = async (id) => {
  const { error } = await supabase
    .from('licenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
// ============================================
// PDF MANAGEMENT - Extended
// ============================================

export const getAllPDFs = async (ficheType = null, clientId = null) => {
  let query = supabase
    .from('pdfs')
    .select(`
      *,
      clients (
        name,
        client_id
      )
    `)
    .order('created_at', { ascending: false });
  
  if (ficheType) {
    query = query.eq('fiche_type', ficheType);
  }
  
  if (clientId) {
    query = query.eq('client_id', clientId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Add public URLs
  const pdfsWithUrls = data.map(pdf => {
    const { data: { publicUrl } } = supabase.storage
      .from('pdfs')
      .getPublicUrl(pdf.storage_path);
    
    return {
      ...pdf,
      publicUrl
    };
  });
  
  return pdfsWithUrls;
};

export const getPDFById = async (id) => {
  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(data.storage_path);
  
  return {
    ...data,
    publicUrl
  };
};

export const deletePDF = async (id) => {
  // Get PDF data first
  const { data: pdf } = await supabase
    .from('pdfs')
    .select('storage_path')
    .eq('id', id)
    .single();
  
  if (pdf) {
    // Delete from storage
    await supabase.storage
      .from('pdfs')
      .remove([pdf.storage_path]);
  }
  
  // Delete from database
  const { error } = await supabase
    .from('pdfs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};


export const createFormationPack = async (packData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('formation_packs')
    .insert([{
      pack_name: packData.pack_name,
      client_id: packData.client_id,
      formation_ids: packData.formation_ids,
      form_data: packData.form_data,
      status: 'in_progress',
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getFormationPackById = async (packId) => {
  const { data, error } = await supabase
    .from('formation_packs')
    .select(`
      *,
      clients (
        name,
        client_id,
        matricule_fiscal,
        address,
        phone
      )
    `)
    .eq('id', packId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getAllFormationPacks = async () => {
  const { data, error } = await supabase
    .from('formation_packs')
    .select(`
      *,
       clients (
        name,
        client_id
      )
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const updateFormationPack = async (packId, updates) => {
  const { data, error } = await supabase
    .from('formation_packs')
    .update(updates)
    .eq('id', packId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteFormationPack = async (packId) => {
  // First get all PDFs in this pack
  const { data: pdfs } = await supabase
    .from('pdfs')
    .select('id, storage_path')
    .eq('pack_id', packId);
  
  // Delete all PDFs from storage
  if (pdfs && pdfs.length > 0) {
    const paths = pdfs.map(pdf => pdf.storage_path);
    await supabase.storage.from('pdfs').remove(paths);
    
    // Delete PDF records
    await supabase.from('pdfs').delete().eq('pack_id', packId);
  }
  
  // Delete the pack
  const { error } = await supabase
    .from('formation_packs')
    .delete()
    .eq('id', packId);
  
  if (error) throw error;
};

export const getPackProgress = async (packId) => {
  const { data, error } = await supabase
    .from('formation_pack_progress')
    .select('*')
    .eq('id', packId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updatePackFiche = async (packId, ficheStep, pdfId) => {
  // Map fiche step to column name
  const columnMap = {
    'programme': 'fiche_programme_id',
    'plan': 'fiche_plan_id',
    'presence': 'fiche_presence_id',
    'evaluation': 'fiche_evaluation_id'
  };
  
  const column = columnMap[ficheStep];
  if (!column) throw new Error('Invalid fiche step');
  
  const updates = { [column]: pdfId };
  
  // Check if all fiches are completed
  const pack = await getFormationPackById(packId);
  const allCompleted = 
    (pack.fiche_programme_id || ficheStep === 'programme') &&
    (pack.fiche_plan_id || ficheStep === 'plan') &&
    (pack.fiche_presence_id || ficheStep === 'presence') &&
    (pack.fiche_evaluation_id || ficheStep === 'evaluation');
  
  if (allCompleted) {
    updates.status = 'completed';
  }
  
  return await updateFormationPack(packId, updates);
};

// Upload PDF and link to pack
export const uploadPDFToPack = async (file, ficheType, ficheStep, clientId, formData, packId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Generate unique filename (sanitize to remove special characters)
  const timestamp = Date.now();
  const sanitizedName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_');
  
  const filename = `${user.id}/${timestamp}-${sanitizedName}`;
  
  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(filename, file);
  
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filename);
  
  // Save metadata to database
  const { data: pdfData, error: dbError } = await supabase
    .from('pdfs')
    .insert([{
      filename: file.name,
      original_name: file.name,
      storage_path: filename,
      size: file.size,
      fiche_type: ficheType,
      fiche_step: ficheStep,
      client_id: clientId,
      form_data: formData,
      pack_id: packId,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (dbError) throw dbError;
  
  // If this is part of a pack, update the pack
  if (packId && ficheStep) {
    await updatePackFiche(packId, ficheStep, pdfData.id);
  }
  
  return {
    ...pdfData,
    publicUrl
  };
};