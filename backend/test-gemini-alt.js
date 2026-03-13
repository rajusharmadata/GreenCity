import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
     // Note: listModels is on the genAI object or requires a specific method depending on SDK
     // In ^0.21.0+, you might need to use the REST API or check if there's a helper.
     // Let's try to just test gemini-1.5-flash-8b as a backup.
     console.log('Testing gemini-1.5-flash...');
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
     const result = await model.generateContent("Hi");
     console.log('✅ Success with gemini-1.5-flash');
  } catch (e) {
     console.log('❌ Failed gemini-1.5-flash:', e.message);
     try {
       console.log('Testing gemini-1.5-flash-latest...');
       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
       const result = await model.generateContent("Hi");
       console.log('✅ Success with gemini-1.5-flash-latest');
     } catch (e2) {
       console.log('❌ Failed gemini-1.5-flash-latest:', e2.message);
     }
  }
};

listModels();
