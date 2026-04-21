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
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } // JSON 응답 강제
  });

  const prompt = `
    Generate a JSON object containing recommendations for families with kids in Seoul/Gyeonggi area.
    Provide 10 free places, 10 paid places, and 3 recommendations for each meal (breakfast, lunch, dinner).
    Include name, name_en, lat, lng, address, and either price/price_en or menu/menu_en.
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
