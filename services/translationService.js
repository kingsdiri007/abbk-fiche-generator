const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Translate text using DeepSeek via OpenRouter
 */
async function translateWithAI(text, targetLang) {
  if (!text || text.trim() === '') return text;
  
  const systemPrompt = targetLang === 'fr' 
    ? 'You are a professional translator. Translate the following text to French. Preserve formatting, line breaks, and special characters. Return ONLY the translated text, no explanations.'
    : 'You are a professional translator. Translate the following text to English. Preserve formatting, line breaks, and special characters. Return ONLY the translated text, no explanations.';

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'ABBK Fiche Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Translation API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original on error
  }
}

/**
 * Translation cache to avoid redundant API calls
 */
class TranslationCache {
  constructor() {
    this.cache = new Map();
    this.loadFromLocalStorage();
  }

  getCacheKey(text, targetLang) {
    // Use first 100 chars + length as key
    const preview = text.substring(0, 100);
    return `${targetLang}:${preview}:${text.length}`;
  }

  get(text, targetLang) {
    const key = this.getCacheKey(text, targetLang);
    return this.cache.get(key);
  }

  set(text, targetLang, translation) {
    const key = this.getCacheKey(text, targetLang);
    this.cache.set(key, translation);
    this.saveToLocalStorage();
  }

  loadFromLocalStorage() {
    try {
      const cached = localStorage.getItem('translationCache');
      if (cached) {
        const entries = JSON.parse(cached);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading translation cache:', error);
    }
  }

  saveToLocalStorage() {
    try {
      const entries = Array.from(this.cache.entries());
      // Keep only last 500 translations to avoid storage limits
      const recent = entries.slice(-500);
      localStorage.setItem('translationCache', JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  }

  clear() {
    this.cache.clear();
    localStorage.removeItem('translationCache');
  }
}

const translationCache = new TranslationCache();

/**
 * Main translation function with caching
 */
export async function translateText(text, targetLang) {
  if (!text || text.trim() === '') return text;
  
  // Check cache first
  const cached = translationCache.get(text, targetLang);
  if (cached) {
    return cached;
  }

  // Translate and cache
  const translation = await translateWithAI(text, targetLang);
  translationCache.set(text, targetLang, translation);
  
  return translation;
}

/**
 * Batch translate multiple texts
 */
export async function translateBatch(texts, targetLang) {
  const results = [];
  
  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5);
    const translations = await Promise.all(
      batch.map(text => translateText(text, targetLang))
    );
    results.push(...translations);
    
    // Small delay between batches
    if (i + 5 < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Translate formation data from database
 */
export async function translateFormation(formation, targetLang) {
  if (!formation) return formation;

  try {
    const fieldsToTranslate = [
      'name',
      'formation_ref', 
      'prerequisites',
      'objectives',
      'competencies'
    ];

    const textsToTranslate = fieldsToTranslate.map(field => formation[field] || '');
    const translations = await translateBatch(textsToTranslate, targetLang);

    const translatedFormation = { ...formation };
    fieldsToTranslate.forEach((field, index) => {
      translatedFormation[field] = translations[index];
    });

    // Translate schedule if exists
    if (formation.schedule && Array.isArray(formation.schedule)) {
      const scheduleTranslations = await Promise.all(
        formation.schedule.map(async (day) => {
          const [content, methods] = await translateBatch([
            day.content || '',
            day.methods || ''
          ], targetLang);

          return {
            ...day,
            content,
            methods
          };
        })
      );

      translatedFormation.schedule = scheduleTranslations;
    }

    return translatedFormation;
  } catch (error) {
    console.error('Error translating formation:', error);
    return formation;
  }
}

/**
 * Translate form data structure
 */
export async function translateFormData(formData, targetLang) {
  if (!formData) return formData;

  try {
    const translatedData = { ...formData };

    // Translate formations data
    if (formData.formationsData) {
      const translatedFormations = {};
      
      for (const [formationId, formationData] of Object.entries(formData.formationsData)) {
        if (!formationData) continue;

        const fieldsToTranslate = [
          'formationName',
          'formationRef',
          'prerequisites',
          'objectives',
          'competencies'
        ];

        const textsToTranslate = fieldsToTranslate.map(field => formationData[field] || '');
        const translations = await translateBatch(textsToTranslate, targetLang);

        translatedFormations[formationId] = { ...formationData };
        fieldsToTranslate.forEach((field, index) => {
          translatedFormations[formationId][field] = translations[index];
        });

        // Translate schedule
        if (formationData.schedule && Array.isArray(formationData.schedule)) {
          const scheduleTranslations = await Promise.all(
            formationData.schedule.map(async (day) => {
              const [content, methods] = await translateBatch([
                day.content || '',
                day.methods || ''
              ], targetLang);

              return {
                ...day,
                content,
                methods
              };
            })
          );

          translatedFormations[formationId].schedule = scheduleTranslations;
        }
      }
      
      translatedData.formationsData = translatedFormations;
    }

    // Translate other fields
    const commonFields = [
      'interventionNature',
      'observations'
    ];

    for (const field of commonFields) {
      if (formData[field]) {
        translatedData[field] = await translateText(formData[field], targetLang);
      }
    }

    // Translate plan data
    if (formData.planData) {
      translatedData.planData = { ...formData.planData };
      
      if (formData.planData.notes) {
        translatedData.planData.notes = await translateText(formData.planData.notes, targetLang);
      }
      
      if (formData.planData.details) {
        translatedData.planData.details = await translateText(formData.planData.details, targetLang);
      }
    }

    // Translate presence data
    if (formData.presenceData) {
      translatedData.presenceData = { ...formData.presenceData };
      
      if (formData.presenceData.themeFormation) {
        translatedData.presenceData.themeFormation = await translateText(
          formData.presenceData.themeFormation, 
          targetLang
        );
      }
      
      if (formData.presenceData.notes) {
        translatedData.presenceData.notes = await translateText(
          formData.presenceData.notes, 
          targetLang
        );
      }
    }

    // Translate evaluation data
    if (formData.evaluationData) {
      translatedData.evaluationData = { ...formData.evaluationData };
      
      if (formData.evaluationData.themeFormation) {
        translatedData.evaluationData.themeFormation = await translateText(
          formData.evaluationData.themeFormation, 
          targetLang
        );
      }
      
      if (formData.evaluationData.notes) {
        translatedData.evaluationData.notes = await translateText(
          formData.evaluationData.notes, 
          targetLang
        );
      }
    }

    return translatedData;
  } catch (error) {
    console.error('Error translating form data:', error);
    return formData;
  }
}

/**
 * Clear translation cache
 */
export function clearTranslationCache() {
  translationCache.clear();
}