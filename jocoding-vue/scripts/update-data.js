const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function updateData() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is missing.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview",
    generationConfig: { responseMimeType: "application/json" } // JSON 응답 강제
  });

  const prompt = `
    Generate a JSON object with the following EXACT structure:
    {
      "kids": {
        "free": [ { "name": "", "name_en": "", "lat": 0.0, "lng": 0.0, "address": "", "price": "", "price_en": "" }, ... (10 items) ],
        "paid": [ { "name": "", "name_en": "", "lat": 0.0, "lng": 0.0, "address": "", "price": "", "price_en": "" }, ... (10 items) ]
      },
      "food": {
        "breakfast": [ { "name": "", "name_en": "", "lat": 0.0, "lng": 0.0, "address": "", "menu": "", "menu_en": "" }, ... (3 items) ],
        "lunch": [ { "name": "", "name_en": "", "lat": 0.0, "lng": 0.0, "address": "", "menu": "", "menu_en": "" }, ... (3 items) ],
        "dinner": [ { "name": "", "name_en": "", "lat": 0.0, "lng": 0.0, "address": "", "menu": "", "menu_en": "" }, ... (3 items) ]
      }
    }
    Recommendations should be for families with kids in Seoul/Gyeonggi area, Korea.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const data = JSON.parse(text);
    const filePath = path.join(__dirname, '../src/assets/data.json');
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Successfully updated data.json');
  } catch (error) {
    console.error('Update failed:', error.message);
    process.exit(1);
  }
}

updateData();
