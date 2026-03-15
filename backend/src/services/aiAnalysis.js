import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import https from 'https';
import http from 'http';

// ─── Fixed categories (exactly 9) ───────────────────────────────────────────
const ALLOWED_CATEGORIES = [
  'Garbage & Waste',
  'Water Pollution',
  'Air Pollution',
  'Road & Infrastructure',
  'Deforestation & Green Cover',
  'Energy Waste',
  'Noise & Visual Pollution',
  'Water Body Damage',
  'Other Environmental Issue',
];

const CATEGORY_DEFINITIONS = {
  'Garbage & Waste': 'Litter, dumping, improper waste disposal, or trash accumulation.',
  'Water Pollution': 'Contaminated water, sewage, or pollutants in water sources.',
  'Air Pollution': 'Smoke, emissions, dust, or poor air quality sources.',
  'Road & Infrastructure': 'Potholes, damaged roads, broken sidewalks, or infrastructure hazards.',
  'Deforestation & Green Cover': 'Tree removal, loss of vegetation, or damage to green spaces.',
  'Energy Waste': 'Unnecessary lighting, leaking energy, or inefficient energy use.',
  'Noise & Visual Pollution': 'Excessive noise or unsightly visual elements harming the environment.',
  'Water Body Damage': 'Damage to rivers, lakes, ponds, or wetlands (banks, erosion, blockage).',
  'Other Environmental Issue': 'Any other environmental concern not fitting the above.',
};

// ─── Fixed severity levels (exactly 4) ────────────────────────────────────────
const ALLOWED_SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

const SEVERITY_DEFINITIONS = {
  Critical: 'Immediate danger to health or ecosystem; requires urgent action.',
  High: 'Significant impact; should be addressed soon.',
  Medium: 'Moderate impact; should be scheduled for resolution.',
  Low: 'Minor impact; can be addressed in routine maintenance.',
};

// ─── Generation config for deterministic output ─────────────────────────────
const GENERATION_CONFIG = {
  temperature: 0.1,
  topK: 10,
  topP: 1,
  maxOutputTokens: 1024,
};

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

const FALLBACK_RESPONSE = {
  category: 'Other Environmental Issue',
  severity: 'Medium',
  description: 'Unable to analyze image. Please try again or report manually.',
  suggestedAction: 'Review and categorize manually if needed.',
  isEnvironmentalIssue: true,
  confidence: 0,
  raw: null,
};

/**
 * Strip markdown code fences from raw model output before parsing.
 */
function stripMarkdownFences(text) {
  if (typeof text !== 'string') return text;
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

/**
 * Validate category against allowed list; default to Other Environmental Issue.
 */
function normalizeCategory(raw) {
  const v = String(raw ?? '').trim();
  if (ALLOWED_CATEGORIES.includes(v)) return v;
  return 'Other Environmental Issue';
}

function normalizeSeverity(raw) {
  const v = String(raw ?? '').trim();
  if (ALLOWED_SEVERITIES.includes(v)) return v;
  return 'Medium';
}

/**
 * Fetch image from URL and return base64 string (no data URL prefix).
 */
async function fetchImageAsBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http;
    protocol.get(imageUrl, { timeout: 15000 }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(buf.toString('base64'));
      });
    }).on('error', reject);
  });
}

/**
 * Get base64 from file path (multer temp file).
 */
async function readFileAsBase64(filePath) {
  const buf = await fs.readFile(filePath);
  return buf.toString('base64');
}

/**
 * Resolve image input to base64. Accepts: base64 string, file path, or URL.
 */
async function resolveImageToBase64(imageInput) {
  if (!imageInput) throw new Error('Missing image input');
  if (typeof imageInput === 'string') {
    if (imageInput.startsWith('data:')) {
      const base64 = imageInput.replace(/^data:image\/\w+;base64,/, '');
      return base64;
    }
    if (imageInput.startsWith('http://') || imageInput.startsWith('https://')) {
      return fetchImageAsBase64(imageInput);
    }
    return readFileAsBase64(imageInput);
  }
  throw new Error('Invalid image input type');
}

/**
 * Build the strict Gemini prompt with fixed categories and severities.
 */
function buildPrompt() {
  const categoryList = ALLOWED_CATEGORIES.map(
    (c) => `- "${c}": ${CATEGORY_DEFINITIONS[c]}`
  ).join('\n');
  const severityList = ALLOWED_SEVERITIES.map(
    (s) => `- "${s}": ${SEVERITY_DEFINITIONS[s]}`
  ).join('\n');

  return `You are an environmental issue classifier. Analyze the image and return ONLY a single valid JSON object. No markdown, no code fences, no preamble, no explanation.

RULES:
1. "category" MUST be exactly one of these (copy the string exactly):
${categoryList}

2. "severity" MUST be exactly one of these (copy the string exactly):
${severityList}

3. "description" MUST be 2 to 3 sentences describing only what is visually present in the image. Be specific (e.g. visible waste, smoke, damage). Do not write generic text.

4. "suggestedAction": One sentence on what authorities should do to fix this.

5. "isEnvironmentalIssue": boolean (true if the image shows an environmental problem, false otherwise).

6. "confidence": number between 0.0 and 1.0 for how confident you are in the classification.

Output format: a single JSON object with keys: category, severity, description, suggestedAction, isEnvironmentalIssue, confidence. Return nothing else.`;
}

/**
 * Analyze an issue image with Gemini Vision. Accepts file path, base64 string, or URL.
 * Uses inline base64 for reliable results. Retries with exponential backoff.
 * Returns normalized fields; category is validated against allowed list.
 */
export async function analyzeIssueImage(imageInput) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const base64Data = await resolveImageToBase64(imageInput);
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        generationConfig: GENERATION_CONFIG,
      });

      const prompt = buildPrompt();
      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const text = result?.response?.text?.() ?? '';
      const cleaned = stripMarkdownFences(text);
      if (!cleaned) throw new Error('Empty AI response');

      const raw = JSON.parse(cleaned);
      const category = normalizeCategory(raw.category);
      const severity = normalizeSeverity(raw.severity);
      const description = String(raw.description ?? '')
        .trim()
        .slice(0, 600);
      const suggestedAction = String(raw.suggestedAction ?? '')
        .trim()
        .slice(0, 600);
      const confidence =
        typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
          ? Math.max(0, Math.min(1, raw.confidence))
          : null;

      return {
        category,
        severity,
        description,
        suggestedAction,
        isEnvironmentalIssue: Boolean(raw.isEnvironmentalIssue),
        confidence,
        raw: { ...raw, category, severity },
      };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[aiAnalysis] All retries failed:', lastError?.message ?? lastError);
  }
  return {
    ...FALLBACK_RESPONSE,
    raw: null,
  };
}

export default { analyzeIssueImage };
