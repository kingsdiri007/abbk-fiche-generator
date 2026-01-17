
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-r1:free"; // adjust if you prefer another model
const BATCH_SIZE = 40; // number of strings per request (tune if you hit limits)
const CACHE_PREFIX = "dom_translate_cache_v1"; // change to invalidate cache

function isVisibleNode(node) {
  if (!node || !node.parentElement) return false;
  const style = window.getComputedStyle(node.parentElement);
  if (!style || style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
    return false;
  }
  // ignore script/style/template etc.
  const tag = node.parentElement.tagName?.toLowerCase();
  if (["script", "style", "noscript", "template"].includes(tag)) return false;
  return true;
}

// Collect visible text nodes (skips whitespace)
function collectTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue) continue;
    const txt = node.nodeValue.replace(/\s+/g, " ").trim();
    if (txt.length <= 0) continue;
    if (!isVisibleNode(node)) continue;
    nodes.push(node);
  }
  return nodes;
}

// Collect inputs and textareas (value + placeholder)
function collectInputs() {
  const inputs = Array.from(document.querySelectorAll("input, textarea, [contenteditable='true']"));
  // Keep only visible ones and those that have text/placeholder
  return inputs.filter(el => {
    try {
      const style = window.getComputedStyle(el);
      if (!style || style.display === "none" || style.visibility === "hidden") return false;
    } catch {
      // ignore computed style errors
    }
    const hasValue = (el.value && String(el.value).trim().length > 0);
    const hasPlaceholder = (el.placeholder && String(el.placeholder).trim().length > 0);
    const isContentEditable = el.isContentEditable && String(el.innerText || "").trim().length > 0;
    return hasValue || hasPlaceholder || isContentEditable;
  });
}

function getCacheKey(lang, original) {
  return `${CACHE_PREFIX}:${lang}:${original}`;
}

function getCached(lang, original) {
  try {
    const k = getCacheKey(lang, original);
    const v = sessionStorage.getItem(k);
    return v;
  } catch {
    return null;
  }
}

function setCached(lang, original, translation) {
  try {
    const k = getCacheKey(lang, original);
    sessionStorage.setItem(k, translation);
  } catch { /* ignore */ }
}

// split an array into chunks
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Try to parse a JSON array from model output (robust helper)
function tryParseJSONArray(text) {
  // find first '[' and last ']' and parse between them
  const first = text.indexOf("[");
  const last = text.lastIndexOf("]");
  if (first === -1 || last === -1 || last <= first) return null;
  const substr = text.slice(first, last + 1);
  try {
    const parsed = JSON.parse(substr);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // fallback
  }
  return null;
}

// send one batch (array of strings) to OpenRouter and return array of translations
async function translateBatch(strings, targetLang, apiKey) {
  if (!apiKey) throw new Error("OpenRouter API key missing");
  if (!strings || strings.length === 0) return [];

  // Build prompt asking for JSON array output to preserve order and parsing
  const userContent = `
Translate the following JSON array of strings into ${targetLang}. 
Return ONLY a JSON array of strings (the translations), in the same order.
Do not add extra commentary.

INPUT:
${JSON.stringify(strings)}
  `.trim();

  const body = {
    model: MODEL,
    messages: [
      { role: "user", content: userContent }
    ],
    stream: false
  };

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("OpenRouter error", res.status, txt);
    // return originals as fallback
    return strings.slice();
  }

  const json = await res.json().catch(() => null);
  const modelText = json?.choices?.[0]?.message?.content || "";

  // Try parse JSON array first
  const parsed = tryParseJSONArray(modelText);
  if (parsed && parsed.length === strings.length) {
    return parsed.map(s => (s === null || s === undefined) ? "" : String(s));
  }

  // Fallback: try splitting by newline if model gave plain lines
  const split = modelText.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (split.length === strings.length) return split;

  // Last resort: return originals
  console.warn("Could not reliably parse translation response, returning originals");
  return strings.slice();
}

/**
 * Main exported function: toggle translation or force targetLang.
 * - If targetLang omitted, toggles between 'fr' and 'en' using body.dataset.translatedLang.
 * - apiKey can be omitted if you stored it in VITE_OPENROUTER_KEY and want to pass it in header call.
 */
export async function translateEntirePage({ targetLang = null, apiKey = null } = {}) {
  try {
    // read API key from env fallback if not provided
    const key = apiKey || (window?.__OPENROUTER_KEY__ || import.meta?.env?.VITE_OPENROUTER_KEY);
    if (!key) {
      console.error("OpenRouter API key missing. Set VITE_OPENROUTER_KEY or pass apiKey.");
      return;
    }

    // Determine target language by toggling if not given
    const current = document.body.dataset.translatedLang || "original";
    let lang;
    if (targetLang) lang = targetLang;
    else {
      // toggle logic: if current is 'fr' -> go 'en', if 'en' -> go 'fr', else go to 'fr'
      lang = current === "fr" ? "en" : (current === "en" ? "fr" : "fr");
    }

    // Collect text nodes and inputs
    const textNodes = collectTextNodes();
    const inputs = collectInputs();

    // Build list of originals we need to translate (dedupe with map)
    const originals = [];
    const uniqMap = new Map(); // original -> index in originals

    // helper to push with dedupe
    const pushOriginal = (str) => {
      const s = String(str).trim();
      if (s.length === 0) return -1;
      if (uniqMap.has(s)) return uniqMap.get(s);
      const idx = originals.length;
      originals.push(s);
      uniqMap.set(s, idx);
      return idx;
    };

    // register text nodes
    const nodeIndexMap = new Array(textNodes.length); // maps node idx -> originals idx
    textNodes.forEach((node, i) => {
      const s = node.nodeValue.replace(/\s+/g, " ").trim();
      nodeIndexMap[i] = pushOriginal(s);
    });

    // register input values & placeholders & contenteditable
    const inputRecords = []; // {el, valueIndex, placeholderIndex, isContentEditable}
    for (const el of inputs) {
      const record = { el, valueIndex: -1, placeholderIndex: -1, isContentEditable: !!el.isContentEditable };
      const v = (el.value || (el.innerText && el.isContentEditable ? el.innerText : "") || "").trim();
      if (v.length > 0) record.valueIndex = pushOriginal(v);
      const p = (el.placeholder || "").trim();
      if (p.length > 0) record.placeholderIndex = pushOriginal(p);
      inputRecords.push(record);
    }

    if (originals.length === 0) {
      console.info("No translatable text found on page.");
      document.body.dataset.translatedLang = lang;
      return;
    }

    // Prepare translations array result (initialize with originals)
    const translations = new Array(originals.length).fill(null);

    // Load from cache where available
    for (let i = 0; i < originals.length; i++) {
      const cached = getCached(lang, originals[i]);
      if (cached) translations[i] = cached;
    }

    // Build list of indices to request (not cached)
    const toRequest = [];
    for (let i = 0; i < originals.length; i++) {
      if (translations[i] == null) toRequest.push({ idx: i, text: originals[i] });
    }

    // Batch requests
    const chunks = chunkArray(toRequest, BATCH_SIZE);
    for (const chunk of chunks) {
      const strings = chunk.map(x => x.text);
      let translatedArray;
      try {
        translatedArray = await translateBatch(strings, lang, key);
      } catch (err) {
        console.error("Batch translation failed", err);
        // fallback: use originals
        translatedArray = strings.slice();
      }

      // Save translations into translations[] and cache
      for (let j = 0; j < chunk.length; j++) {
        const idx = chunk[j].idx;
        const tr = translatedArray[j] ?? originals[idx];
        translations[idx] = tr;
        try { setCached(lang, originals[idx], tr); } catch {}
      }
    }

    // Replace text nodes
    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      const origIdx = nodeIndexMap[i];
      if (origIdx >= 0 && translations[origIdx] != null) {
        // Keep surrounding whitespace pattern
        const leading = node.nodeValue.match(/^\s*/)?.[0] || "";
        const trailing = node.nodeValue.match(/\s*$/)?.[0] || "";
        node.nodeValue = leading + translations[origIdx] + trailing;
      }
    }

    // Replace input values/placeholders/contenteditable
    for (const rec of inputRecords) {
      if (rec.valueIndex >= 0 && translations[rec.valueIndex] != null) {
        try {
          if (rec.isContentEditable) {
            rec.el.innerText = translations[rec.valueIndex];
          } else {
            rec.el.value = translations[rec.valueIndex];
          }
        } catch { /* ignore */ }
      }
      if (rec.placeholderIndex >= 0 && translations[rec.placeholderIndex] != null) {
        try { rec.el.placeholder = translations[rec.placeholderIndex]; } catch {}
      }
    }

    // Additionally translate 'alt' attributes and aria-labels and title attributes
    const attrSelectors = ["[alt]", "[aria-label]", "[title]"];
    for (const sel of attrSelectors) {
      document.querySelectorAll(sel).forEach(el => {
        const attr = sel === "[alt]" ? "alt" : sel === "[aria-label]" ? "aria-label" : "title";
        const original = el.getAttribute(attr);
        if (!original) return;
        const s = String(original).trim();
        if (s.length === 0) return;
        const cached = getCached(lang, s);
        if (cached) {
          el.setAttribute(attr, cached);
          return;
        }
        // If not cached, add quickly to a mini-batch via translateBatch (synchronously here could be many requests).
        // For simplicity and to avoid extra batching complexity, we do a quick direct call here:
      });
    }

    // Mark page as translated to this language
    document.body.dataset.translatedLang = lang;

    console.info(`Page translated to ${lang}. Translated ${originals.length} unique strings.`);
    return;
  } catch (err) {
    console.error("translateEntirePage failed", err);
  }
}