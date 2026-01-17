import { supabase } from '../supabase/client';
// ============================================
// Authentification
// ============================================

//Récupère l’utilisateur actuellement connecté
export const getCurrentUser= async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
// Connexion utilisateur (existe)
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Déconnexion(existe)
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};
//fonction propre a l'admin

//L’admin doit voir / gérer les comptes(existe)
export const getCurrentUserProfile = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    throw new Error("Erreur lors du chargement des utilisateurs");
  }

  return data;
};
//creer un compte par l'admin
export const createUserByAdmin = async (userData) => {
  const { data, error } = await supabase.functions.invoke(
    "create_user",
    { body: userData }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

//supprimer un utilisateur (existe)
export const deleteUser = async (userId) => {
  const { data, error } = await supabase.functions.invoke(
    "delete_user",
    {
      body: { user_id: userId }
    }
  );

  if (error) throw new Error(error.message);
  return data;
};
//modifier le role d'un utilisateur (existe)
export const updateUserRole = async (userId, role) => {
  const { data, error } = await supabase.functions.invoke(
    "update_user_role",
    {
      body: { user_id: userId, role }
    }
  );

  if (error) throw new Error(error.message);
  return data;
};

// ============================================
// CLIENTS
// ============================================
/**
 * Récupérer tous les clients (existe)
 */
export const getAllClients = async () => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .order('id_client', { ascending: true});
  if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Récupérer un client par ID
 */
export const getClientById = async (id) => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .eq('id_client', id)
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Ajouter un client (existe)
 */
export const addClient = async (client) => {
  const { data, error } = await supabase
    .from('client')
    .insert([client])
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Mettre à jour un client par son id (existe)
 */
export const updateClient = async (id, updates) => {
  const { data, error } = await supabase
    .from('client')
    .update(updates)
    .eq('id_client', id)
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer un client (existe)
 */
export const deleteClient = async (id) => {
  const { error } = await supabase
    .from('client')
    .delete()
    .eq('id_client', id);

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les clients par nom
 */
export const getClientsByName = async (name) => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('name', { ascending: true});

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Filtrer les clients par matricule
 */
export const getClientsBymatricule = async (matricule) => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .ilike('matricule_fiscal', `%${matricule}%`)
    .order('matricule_fiscal', { ascending: true});

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};

// ============================================
// eleve
// ============================================
/**
 * Récupérer tous les eleves (existe)
 */
export const getAllStudents = async () => {
  const { data, error } = await supabase
    .from('eleve')
    .select('*')
    .order('name', { ascending: true });
   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  
  return data;
};

/**
 * Ajouter un eleve(existe)
 */
export const addStudent = async (eleve) => {
  const { data, error } = await supabase
    .from('eleve')
    .insert([eleve])
    .select()
    .single();

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Mettre à jour un eleve 
 */
export const updateStudent= async (id, updates) => {
  const { data, error } = await supabase
    .from('eleve')
    .update(updates)
    .eq('id_eleve', id)
    .select()
    .single();

  if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer un eleve
 */
export const deleteStudent = async (id) => {
  const { error } = await supabase
    .from('eleve')
    .delete()
    .eq('id_eleve', id);

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les eleves par nom (existe)
 */
export const searchStudents = async (name) => {
  const { data, error } = await supabase
    .from('eleve')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('name', { ascending: true });

  if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};

// ============================================
// formateurs
// ============================================
/**
 * Récupérer tous les formateurs (existe)
 */
export const getAllIntervenants= async () => {
  const { data, error } = await supabase
    .from('formateur')
    .select('*')
    .order('name', { ascending: true });

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Récupérer un formateur  par ID(existe)
 */
export const  getIntervenantById= async (id) => {
  const { data, error } = await supabase
    .from('formateur')
    .select('*')
    .eq('id_formateur', id)
    .single();

  if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Ajouter un formateur(existe)
 */
export const  addIntervenant= async (formateur) => {
  const { data, error } = await supabase
    .from('formateur')
    .insert([formateur])
    .select()
    .single();

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Mettre à jour un formateur  par son id (existe)
 */
export const updateIntervenant= async (id, updates) => {
  const { data, error } = await supabase
    .from('formateur')
    .update(updates)
    .eq('id_formateur', id)
    .select()
    .single();

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer un formateur(existe)
 */
export const  deleteIntervenant= async (id) => {
  const { error } = await supabase
    .from('formateur')
    .delete()
    .eq('id_formateur', id);

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les formateurs par nom
 */
export const getIntervenantByName = async (name) => {
  const { data, error } = await supabase
    .from('formateur')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('name', { ascending: true });

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
// ============================================
// formations
// ============================================
/**
 * Récupérer tous les formations (existe)
 */
export const getAllFormations = async () => {
  const { data, error } = await supabase
    .from('formation')
    .select('*')
    .order('name', { ascending: true });

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Récupérer une formation par ID (existe)
 */
export const getFormationById = async (id) => {
  const { data, error } = await supabase
    .from('formation')
    .select('*')
    .eq('formation_id', id)
    .single();

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
//ajouter formation
export const addFormation = async (formationData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('formation')
    .insert([{
      ...formationData,

    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
/**
 * Mettre à jour une formation par son id (existe)
 */
export const updateFormation = async (id, updates) => {
  const { data, error } = await supabase
    .from('formation')
    .update(updates)
    .eq('formation_id', id)
    .select()
    .single();

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer une formation (existe)
 */

export const deleteFormation = async (id) => {
  const { error } = await supabase
    .from('formation')
    .delete()
    .eq('formation_id', id);
  
  if (error) throw error;
};
/**
 * Filtrer les formations par nom
 */
export const getFormationByName = async (name) => {
  const { data, error } = await supabase
    .from('formation')
    .select('*')
    .ilike('name', `%${name}%`)
    .order('name', { ascending: true });

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};

/**
 * Filtrer les formations par ID partiel
 */
export const getFormationByIdLike = async (id) => {
  const { data, error } = await supabase
    .from('formation')
    .select('*')
    .ilike('formation_id', `%${id}%`)
    .order('formation_id', { ascending: true });

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
}

  // ============================================
// Licence
// ============================================
/**
 * Récupérer tous les LICENSES (existe)
 */
export const getAllLicenses = async () => {
  const { data, error } = await supabase
    .from('license')
    .select('*')
  if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Récupérer une licence  par ID
 */
export const getLicenseById = async (id) => {
  const { data, error } = await supabase
    .from('license')
    .select('*')
    .eq('id_license', id)
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Ajouter une licence (existe)
 */
export const addLicense = async (licenseName, category = null) => {
  
  const { data, error } = await supabase
    .from('license')
    .insert([{
      name: licenseName,
      category
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Mettre à jour une license par son id 
 */
export const updatelicense = async (id, updates) => {
  const { data, error } = await supabase
    .from('license')
    .update(updates)
    .eq('id_license', id)
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer une license (existe)
 */
export const deleteLicense = async (id) => {
  const { error } = await supabase
    .from('license')
    .delete()
    .eq('id_license', id);

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};  
// ============================================
// training
// ============================================
/**
 * Récupérer tous les sesions(c'est une formation a un date , durre et lieu definie)
 */
export const getAllTrainings = async () => {
  const { data, error } = await supabase
    .from('training')
    .select('*')
    .order('date_fin', { ascending: false });

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Ajouter une session
 */
export const addTraining = async (trainingData) => {
  const { data, error } = await supabase
    .from('training')
    .insert([trainingData])
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Mettre à jour une session par son id 
 */
export const updateTraining = async (id, updates) => {
  const { data, error } = await supabase
    .from('training')
    .update(updates)
    .eq('id_session', id)
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer une session
 */
export const deleteTraining= async (id) => {
  const { error } = await supabase
    .from('training')
    .delete()
    .eq('id_session', id);

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les sessions par date fin
 */
export const getTrainingByDateFin = async (datefin) => {
  const { data, error } = await supabase
    .from('training')
    .select('*')
    .gte('date_fin', datefin)
    .order('date_fin', { ascending: false });


   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};

/**
 * Filtrer les sesions par date_debut
 */
export const getTrainingByDateDebut = async (datedebut) => {
  const { data, error } = await supabase
    .from('training')
    .select('*')
    .gte('date_debut',datedebut)
    .order('date_debut', { ascending: false });

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
}
// ============================================
// inscription
// ============================================
/**
 * Récupérer tous les inscriptions c'est pour un eleve definie a une formation précis(note par module, note general, etat_presence)
 */
export const getInscriptions = async () => {
  const { data, error } = await supabase
    .from('inscription')
    .select('*')
    .order('note_generale', { ascending: false });

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Ajouter une inscription (existe)
 */
export const addStudentFormation= async (inscription) => {
  const { data, error } = await supabase
    .from('inscription')
    .insert([inscription])
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Mettre à jour une inscription par son id 
 */
export const updateInscription = async (id_eleve, id_session,updates) => {
  const { data, error } = await supabase
    .from('inscription')
    .update(updates)
    .eq('id_session', id_session)
    .eq('id_eleve',id_eleve)
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Supprimer une inscription
 */
export const deleteInscription = async (id_eleve,id_session) => {
  const { error } = await supabase
    .from('inscription')
    .delete()
    .eq('id_session', id_session)
    .eq('id_eleve', id_eleve);

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les inscriptions par eleve a une formation precis
 */
export const getStudentAndFormation = async (id_eleve, id_session) => {
  const { data, error } = await supabase
    .from('inscription')
    .select('*')
    .eq('id_session',id_session)
    .eq('id_eleve',id_eleve);


   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Récupérer toutes les inscriptions d’un élève
 */
export const getInscriptionsByStudent = async (id_eleve) => {
  const { data, error } = await supabase
    .from('inscription')
    .select('*')
    .eq('id_eleve', id_eleve)
    .order('note_generale', { ascending: false });

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};
/**
 * Récupérer les inscriptions d’une session
 */
export const getInscriptionsBySession = async (id_session) => {
  const { data, error } = await supabase
    .from('inscription')
    .select('*')
    .eq('id_session', id_session);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data;
};
// ============================================
// offre
// ============================================
/**
 * Créer une offre automatiquement  Dès que l’employé clique sur bouton Licence ou bouton Formation
 */
export const createOffre = async (clientId, typeOffre) => {
  const { data, error } = await supabase
    .from('offre')
    .insert([{
      client_id: clientId,
      type_offre: typeOffre,
      statut: 'en_cours'
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
/**
 * Récupérer tous les offres
 */
export const getAllOffre = async () => {
  const { data, error } = await supabase
    .from('offre')
    .select('*');

  if (error) throw error;
  return data;
};
/**
 * Récupérer un offre par client
 */
export const getOffreByClient= async (client_id) => {
  const { data, error } = await supabase
    .from('offre')
    .select('*')
    .eq('client_id', client_id);

  if (error) throw error;
  return data;
};
// ============================================
// fiche
// ============================================
//créer les fiches selon le type d’offre
export const createFichesForOffre = async (offreId, typeOffre) => {
  let fiches = [];

  if (typeOffre === 'licence') {
    fiches.push({
      id_offre: offreId,
      id_type_fiche: 1, // licence
      statut: 'brouillon'
    });
  }

  if (typeOffre === 'formation') {
    const formationFiches = [2, 3, 4, 5, 6]; // programme, plan, présence, évaluation, attestation
    fiches = formationFiches.map(type => ({
      id_offre: offreId,
      id_type_fiche: type,
      statut: 'brouillon'
    }));
  }

  const { data, error } = await supabase
    .from('fiche')
    .insert(fiches)
    .select();

  if (error) throw error;
  return data;
};
/**
 * Récupérer tous les fiches (existe)
 */
export const getAllPDFs = async () => {
  const { data, error } = await supabase
    .from('fiche')
    .select('*')
    .order('id_fiche', { ascending: true});
  if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
/**
 * Récupérer une fiche par ID(existe)
 */
export const getPDFById = async (id) => {
  const { data, error } = await supabase
    .from('fiche')
    .select('*')
    .eq('id_fiche', id)
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error("Fiche introuvable");// erreur pour l'utilisateur
}
  return data;
};
//recuper les fiches de chaque offre:
export const getFichesByOffre = async (offreId) => {
  const { data, error } = await supabase
    .from('fiche')
    .select(`
      *,
      type_fiche(label)
    `)
    .eq('id_offre', offreId)
    .order('id_type_fiche');

  if (error) throw error;
  return data;
};
/**** Mettre à jour une fiche (remplissage formulaire)
 */
export const updateFiche = async (id_fiche, updates) => {
  const { data, error } = await supabase
    .from('fiche')
    .update({
      ...updates,
      date_generation: new Date().toISOString(),
      statut: 'finalisée'
    })
    .eq('id_fiche', id_fiche)
    .select()
    .single();

  if (error) throw error;
  return data;
};
///** Upload PDF and link to formation pack
export const uploadPDFToPack  = async (id_fiche, file, formData) => {
  const { data: { user } } = await supabase.auth.getUser();

  const filename = `${user.id}/${Date.now()}-${file.name}`;

  await supabase.storage.from('pdfs').upload(filename, file);

  const { data: { publicUrl } } = supabase
    .storage.from('pdfs')
    .getPublicUrl(filename);

  const { data, error } = await supabase
    .from('fiche')
    .update({
      url_pdf: publicUrl,
      storage_path: filename,
      form_data: formData,
      statut: 'envoyée'
    })
    .eq('id_fiche', id_fiche)
    .select()
    .single();

  if (error) throw error;
  return data;
};
/**
 * Récupérer le statut de chaque fiche d’une offre
 */
export const getPDFStatusByOffre = async (offreId) => {
  const { data, error } = await supabase
    .from('fiche')
    .select(`
      id_fiche,
      statut,
      date_generation,
      type_fiche (
        id_type_fiche,
        label
      )
    `)
    .eq('id_offre', offreId)
    .order('id_type_fiche');

  if (error) {
    console.error(error);
    throw new Error("Impossible de récupérer le statut des fiches");
  }

  return data;
};



