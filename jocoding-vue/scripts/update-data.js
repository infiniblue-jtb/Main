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
        "free": [ { "name": "장소명", "name_en": "Place Name", "lat": 0.0, "lng": 0.0, "address": "", "price": "무료", "price_en": "Free" }, ... (6 items total) ],
        "paid": [ { "name": "장소명", "name_en": "Place Name", "lat": 0.0, "lng": 0.0, "address": "", "price": "", "price_en": "" }, ... (6 items total) ]
      },
      "food": {
        "breakfast": [ { "name": "식당명", "name_en": "Restaurant Name", "lat": 0.0, "lng": 0.0, "address": "", "menu": "", "menu_en": "" }, ... (3 items total) ],
        "lunch": [ { "name": "식당명", "name_en": "Restaurant Name", "lat": 0.0, "lng": 0.0, "address": "", "menu": "", "menu_en": "" }, ... (3 items total) ],
        "dinner": [ { "name": "식당명", "name_en": "Restaurant Name", "lat": 0.0, "lng": 0.0, "address": "", "menu": "", "menu_en": "" }, ... (3 items total) ]
      }
    }
    Recommendations should be for families with kids in Seoul/Gyeonggi area, Korea. 
    IMPORTANT: Do NOT include any numbering (like 1., 2.) in the names.
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
