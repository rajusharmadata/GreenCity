import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const ALLOWED_CATEGORIES = [
  'Waste',
  'Infrastructure',
  'Road Hazard',
  'Vandalism',
  'Air Quality',
  'Water',
  'Noise',
  'Other'
];

const ALLOWED_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const parseStrictJson = (text) => {
  const trimmed = (text ?? '').trim();
  if (!trimmed) throw new Error('Empty AI response');

  // Gemini sometimes wraps JSON in ```json ... ```
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() || trimmed;
  return JSON.parse(candidate);
};

const mapCategoryToIssueEnum = (raw) => {
  const v = String(raw || '').trim();
  if (ALLOWED_CATEGORIES.includes(v)) return v;

  // light mapping categories to existing enums
  const lower = v.toLowerCase();
  if (lower.includes('garbage') || lower.includes('waste') || lower.includes('dump')) return 'Waste';
  if (lower.includes('road')) return 'Road Hazard';
  if (lower.includes('air')) return 'Air Quality';
  if (lower.includes('water')) return 'Water';
  if (lower.includes('noise')) return 'Noise';
  if (lower.includes('vandal')) return 'Vandalism';
  if (lower.includes('infrastructure')) return 'Infrastructure';
  return 'Other';
};

const clampSeverity = (raw) => {
  const v = String(raw || '').trim();
  if (ALLOWED_SEVERITIES.includes(v)) return v;
  return 'Medium';
};

/**
 * Reverse Geocoding using OpenRouteService
 */
export const reverseGeocode = async (lat, lng) => {
  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey || !lat || !lng) return 'Unknown';

  try {
    const url = `https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lon=${lng}&point.lat=${lat}&size=1`;
    const response = await axios.get(url);
    const feature = response.data?.features?.[0];
    if (feature?.properties?.label) {
      return feature.properties.label;
    }
    return 'Unknown';
  } catch (error) {
    console.warn('[Geocoding] Mapping error:', error.message);
    return 'Unknown';
  }
};

/**
 * Analyze an issue image URL with Gemini and return normalized fields.
 */
export const analyzeIssueImage = async (imageUrl) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }
  if (!imageUrl) {
    throw new Error('Missing imageUrl');
  }

  // 1. Fetch the image data
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const base64Data = Buffer.from(response.data).toString('base64');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // 2. Use the most basic model initialization
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  
  console.log(`[AI] Using model: ${modelName}`);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
Analyze this image of a city environmental or infrastructure issue and return ONLY valid JSON.
Fields:
- category: one of ${JSON.stringify(ALLOWED_CATEGORIES)}
- severity: one of ${JSON.stringify(ALLOWED_SEVERITIES)}
- description: Short description of the issue
- suggestedAction: How city authorities should fix it
- isEnvironmentalIssue: boolean
- confidence: number 0-1
`;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
    ]);

    const text = result?.response?.text?.() ?? '';
    const raw = parseStrictJson(text);

    return {
      category: mapCategoryToIssueEnum(raw.category),
      severity: clampSeverity(raw.severity),
      description: String(raw.description || '').trim().slice(0, 600),
      suggestedAction: String(raw.suggestedAction || '').trim().slice(0, 600),
      isEnvironmentalIssue: Boolean(raw.isEnvironmentalIssue),
      confidence:
        typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
          ? Math.max(0, Math.min(1, raw.confidence))
          : 0.5,
      raw
    };
  } catch (error) {
    console.error('Gemini Analysis Error:', error.message);
    // Generic fallback for production if AI fails
    return {
      category: 'Other',
      severity: 'Medium',
      description: 'Reported issue awaiting manual verification.',
      suggestedAction: 'Inspect location and evaluate.',
      isEnvironmentalIssue: true,
      confidence: 0,
      raw: { error: error.message }
    };
  }
};

export default { analyzeIssueImage, reverseGeocode };
