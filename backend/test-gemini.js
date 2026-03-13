import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const testGemini = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Missing GEMINI_API_KEY in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const rawModelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const modelName = rawModelName.startsWith('models/') ? rawModelName : `models/${rawModelName}`;
  
  console.log(`Testing model: ${modelName} with default SDK...`);
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = "Say 'OK'";
    const result = await model.generateContent(prompt);
    console.log('✅ Success!');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
};

testGemini();
