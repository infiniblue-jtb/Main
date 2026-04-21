const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function updateData() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is not set in GitHub Secrets.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Provide a JSON object for kid-friendly places in Seoul/Gyeonggi area and food recommendations.
    The response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON.
    
    Structure:
    {
      "kids": {
        "free": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "price": "string", "price_en": "string"}],
        "paid": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "price": "string", "price_en": "string"}]
      },
      "food": {
        "breakfast": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "menu": "string", "menu_en": "string"}],
        "lunch": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "menu": "string", "menu_en": "string"}],
        "dinner": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "menu": "string", "menu_en": "string"}]
      }
    }
    
    Make the items realistic and popular.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // JSON만 추출하기 위한 정규표현식
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not find JSON in Gemini response: " + text);
    }
    
    const jsonText = jsonMatch[0];
    const data = JSON.parse(jsonText);
    
    const filePath = path.join(__dirname, '../src/assets/data.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Successfully updated data.json');
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

updateData();
