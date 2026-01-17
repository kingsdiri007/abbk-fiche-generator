import { supabase } from '../supabase/client';
// ============================================
// Authentification
// ============================================
/////////tous les utilisateurs 

//Récupérer le profil de l’utilisateur connecté (existe)
/*export const getCurrentUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilisateur non authentifié");
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, email')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Impossible de charger le profil");
  }

  return data;
};*/

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
/**
 * Ajouter une formation (existe)
 */
/*export const addFormation = async (formation) => {
  const { data, error } = await supabase
    .from('formation')
    .insert([formation])
    .select()
    .single();

     if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};*/
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
// training
// ============================================
/**
 * Récupérer tous les sesions(c'est une formation a un date , durre et lieu definie)
 */
export const getTraining = async () => {
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
export const addTraining = async (training) => {
  const { data, error } = await supabase
    .from('training')
    .insert([training])
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
export const getTrainingBydatefin = async (datefin) => {
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
export const getTrainingBydatedebut = async (datedebut) => {
  const { data, error } = await supabase
    .from('training')
    .select('*')
    .gte('date_debut',datedebut);

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
// ============================================
// packs
// ============================================
/**
 * Récupérer tous les packs (existe)
 */
export const getAllFormationPacks = async () => {
  const { data, error } = await supabase
    .from('pack')
    .select('*')
    .order('date_creation', { ascending: false });

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};

/**
 * Mettre à jour un pack par son id (existe)
 */
export const updateFormationPack = async (id,updates) => {
  const { data, error } = await supabase
    .from('pack')
    .update(updates)
    .eq('id_pack', id)
    .select()
    .single();

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
// ** le pack est cree automatiquement des que j'ai le client  (existe)
export const  createFormationPack= async (client, formations) => {
  // 1. créer le client
  const newClient = await addClient(client);

  // 2. créer automatiquement le pack
  const pack = {
    id_client: newClient.id_client,
    date_creation: new Date().toISOString()
  };

  const { data: newPack, error: packError } = await supabase
    .from('pack')
    .insert([pack])
    .select()
    .single();
    if (packError) {
  console.error(packError);
  throw new Error("Erreur lors de la création du pack");
}
  // 3. lier les formations au pack
  for (const formation of formations) {
    const { error } = await supabase
  .from('pack_formation')
  .insert({
    id_pack: newPack.id_pack,
    id_formation: formation.id_formation
  });

if (error) {
  console.error(error);
  throw new Error("Erreur lors d association pack / formation");
}

  }

  return newPack;
};

/**
 * Supprimer un pack (existe)
 */
export const deleteFormationPack = async (id) => {
  const { error } = await supabase
    .from('pack')
    .delete()
    .eq('id_pack', id)

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les packs par date_creation
 */
export const getPacksBydate = async (date) => {
  const { data, error } = await supabase
    .from('pack')
    .select('*')
    .gte('date_creation', date)
    .order('date_creation', { ascending: true });


   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
// ============================================
// fiche
// ============================================

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
 * Récupérer les fiches d’un pack 
 */
export const getPDFByPpackId = async (id_pack) => {
  const { data, error } = await supabase
    .from('fiche')
    .select('*')
    .eq('id_pack', id_pack)
    .order('id_type_fiche');

  if (error) {
    console.error(error);
    throw new Error("Impossible de récupérer les fiches du pack");
  }

  return data;
};
/**
 * Récupérer une fiche précise (pack + type)
 */
export const getPDFsByPackAndType = async (id_pack, id_type_fiche) => {
  const { data, error } = await supabase
    .from('fiche')
    .select('*')
    .eq('id_pack', id_pack)
    .eq('id_type_fiche', id_type_fiche)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Fiche introuvable");
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
/**** Mettre à jour une fiche (remplissage formulaire)
 */
export const updatePDF = async (id_pack, id_type_fiche, updates) => {
  const { data, error } = await supabase
    .from('fiche')
    .update({
      ...updates,
      date_generation: new Date().toISOString()
    })
    .eq('id_pack', id_pack)
    .eq('id_type_fiche', id_type_fiche)
    .select()
    .single();
    if (error) {
    console.error(error);
    throw new Error("Erreur lors de la mise à jour de la fiche");
  }

  return data;
};

/**
 * Supprimer une fiche(existe)
 */
export const deletePDF= async (id) => {
  const { error } = await supabase
    .from('fiche')
    .delete()
    .eq('id_fiche', id);

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
};
/**
 * Filtrer les fiches par date
 */
export const getFicheBydate = async (date) => {
  const { data, error } = await supabase
    .from('fiche')
    .select('*')
    .gte('date_generation',date)
    .order('date_generation', { ascending: true});

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};
// ===============================
// Dashboard 
// ===============================
//Vérifier que l’utilisateur connecté est un admin
export const checkIfAdmin = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Utilisateur non authentifié");
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Erreur lors de la vérification du rôle");
  }

  return data.role === 'admin';
};

// Récupération du rôle utilisateur : verifie que l'utilisateur Rest authentifie (existe)
export const getUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error getting user role:', error);
      return null;
    }
    
    return profile?.role || 'normal';
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

//Charger les données du dashboard en respectant les droits d’accès
export const loadDashboard = async () => {
  const role= await getCurrentUser();

  const { data, error } = await supabase
    .from('v_pack_fiches_dashboard')
    .select('*')
    .order('id_pack');

  if (error) {
    console.error(error);
    throw new Error("Erreur lors du chargement du dashboard");
  }

  return data;
};

// Transformer les données plates de la vue en structure exploitable par l’UI
export const getPackProgress = (rows) => {
  //Parcours toutes les lignes retournées par la vue
  return rows.reduce((acc, row) => {
    //Crée un pack s’il n’existe pas encore
    if (!acc[row.id_pack]) {
      acc[row.id_pack] = {
        id_pack: row.id_pack,
        fiches: []
      };
    }
//Ajoute chaque fiche à son pack
    acc[row.id_pack].fiches.push({
      libelle: row.libelle,
      etat: row.etat_fiche
    });

    return acc;
  }, 
  {});
};
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
    .order('date_creation', { ascending: true});
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
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('license')
    .insert([{
      name: licenseName,
      category,
    //  created_by: user?.id
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

/**
 * Filtrer les licences par date_creation
 */
export const getlicensesBydate = async (date) => {
  const { data, error } = await supabase
    .from('license')
    .select('*')
    .gte('date_creation',date)
    .order('date_creation', { ascending: true});

   if (error) {
  console.error(error);// erreur pour développeur
  throw new Error(error.message);// erreur pour l'utilisateur
}
  return data;
};




// ============================================
// MISSING AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Sign up new user (for admin user creation)
 */
export const signUp = async (email, password, name, role = 'user') => {
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

// ============================================
// CLIENT SEARCH FUNCTION
// ============================================

/**
 * Search clients by name or matricule
 */
export const searchClients = async (searchTerm) => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,matricule.ilike.%${searchTerm}%,client_id.ilike.%${searchTerm}%`)
    .order('name', { ascending: true });
  
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

// ============================================
// FORMATION CUSTOM SAVE
// ============================================

/**
 * Save custom formation (for admins modifying templates)
 */
export const saveCustomFormation = async (originalId, formationData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const customId = `custom-${Date.now()}`;
  
  const { data, error } = await supabase
    .from('formation')
    .insert([{
      formation_id: customId,
      ...formationData,
      is_custom: true,
      original_id: originalId,
      created_by: user?.id
    }])
    .select()
    .single();
  
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

// ============================================
// STUDENT WITH FORMATIONS
// ============================================

/**
 * Get student with their formation history
 */
export const getStudentWithFormations = async (studentId) => {
  // First get the student
  const { data: student, error: studentError } = await supabase
    .from('eleve')
    .select('*')
    .eq('id_eleve', studentId)
    .single();

  if (studentError) {
    console.error(studentError);
    throw new Error(studentError.message);
  }

  // Get all inscriptions for this student with formation details
  const { data: inscriptions, error: inscError } = await supabase
    .from('inscription')
    .select(`
      *,
      training!inner(
        *,
        formation!inner(*)
      )
    `)
    .eq('id_eleve', studentId)
    .order('training(date_fin)', { ascending: false });

  if (inscError) {
    console.error(inscError);
    throw new Error(inscError.message);
  }

  // Transform inscriptions into formation history
  const student_formations = inscriptions.map(insc => ({
    id: insc.id_inscription,
    formation_name: insc.training?.formation?.name || 'Unknown',
    note_general: insc.note_generale,
    completion_date: insc.training?.date_fin,
    evaluation_details: insc,
    created_at: insc.created_at
  }));

  return {
    ...student,
    student_formations
  };
};

// ============================================
// PDF UPLOAD TO PACK
// ============================================

/**
 * Upload PDF and link to formation pack
 */
export const uploadPDFToPack = async (file, ficheType, ficheStep, clientId, formData, packId = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Determine the type_fiche ID based on ficheStep
  const ficheTypeMap = {
    'programme': 1,
    'plan': 2,
    'presence': 3,
    'evaluation': 4
  };
  
  const id_type_fiche = ficheTypeMap[ficheStep] || 1;

  // Generate filename
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
  
  if (uploadError) {
    console.error(uploadError);
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filename);

  // Check if fiche already exists for this pack and type
  const { data: existingFiche } = await supabase
    .from('fiche')
    .select('id_fiche')
    .eq('id_pack', packId)
    .eq('id_type_fiche', id_type_fiche)
    .maybeSingle();

  if (existingFiche) {
    // Update existing fiche
    const { data: ficheData, error: updateError } = await supabase
      .from('fiche')
      .update({
        url_pdf: publicUrl,
        storage_path: filename,
        date_generation: new Date().toISOString(),
        form_data: formData
      })
      .eq('id_fiche', existingFiche.id_fiche)
      .select()
      .single();

    if (updateError) {
      console.error(updateError);
      throw new Error(updateError.message);
    }

    return {
      ...ficheData,
      publicUrl
    };
  } else {
    // Create new fiche
    const { data: ficheData, error: insertError } = await supabase
      .from('fiche')
      .insert([{
        id_pack: packId,
        id_type_fiche: id_type_fiche,
        url_pdf: publicUrl,
        storage_path: filename,
        date_generation: new Date().toISOString(),
        form_data: formData
      }])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      throw new Error(insertError.message);
    }

    return {
      ...ficheData,
      publicUrl
    };
  }
};

// ============================================
// FICHE STATUS UPDATE
// ============================================

/**
 * Update fiche status (done/in_progress)
 */
export const updateFicheStatus = async (packId, ficheStep, status) => {
  // Map fiche step to type_fiche ID
  const ficheTypeMap = {
    'programme': 1,
    'plan': 2,
    'presence': 3,
    'evaluation': 4
  };
  
  const id_type_fiche = ficheTypeMap[ficheStep];

  // Update the fiche etat
  const { data, error } = await supabase
    .from('fiche')
    .update({ 
      etat_fiche: status === 'done' ? 'Terminé' : 'En cours'
    })
    .eq('id_pack', packId)
    .eq('id_type_fiche', id_type_fiche)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  // Check if all fiches are done to update pack status
  const { data: allFiches } = await supabase
    .from('fiche')
    .select('etat_fiche')
    .eq('id_pack', packId);

  const allDone = allFiches && allFiches.every(f => f.etat_fiche === 'Terminé');
  
  if (allDone) {
    await supabase
      .from('pack')
      .update({ etat_pack: 'Terminé' })
      .eq('id_pack', packId);
  }

  return data;
};

// ============================================
// UPLOAD PDF (Simple version for licenses)
// ============================================

/**
 * Upload PDF without pack (for license installations)
 */
export const uploadPDF = async (file, ficheType, clientId, formData) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  const timestamp = Date.now();
  const sanitizedName = file.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_');
  
  const filename = `${user.id}/${timestamp}-${sanitizedName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(filename, file);
  
  if (uploadError) {
    console.error(uploadError);
    throw new Error(uploadError.message);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filename);

  // For licenses, we might store in a different table or just return the URL
  // Adjust based on your database schema
  return {
    publicUrl,
    filename,
    storage_path: filename
  };
};