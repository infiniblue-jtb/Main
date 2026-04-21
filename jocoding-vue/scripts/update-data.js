const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function updateData() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Provide a JSON object for kid-friendly places in Seoul/Gyeonggi area and food recommendations.
    The response MUST be a valid JSON object only, without any markdown formatting or code blocks.
    
    Structure:
    {
      "kids": {
        "free": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "price": "string", "price_en": "string"}], // 10 items
        "paid": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "price": "string", "price_en": "string"}] // 10 items
      },
      "food": {
        "breakfast": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "menu": "string", "menu_en": "string"}], // 3 items
        "lunch": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "menu": "string", "menu_en": "string"}], // 3 items
        "dinner": [{"name": "string", "name_en": "string", "lat": number, "lng": number, "address": "string", "menu": "string", "menu_en": "string"}] // 3 items
      }
    }
    
    Ensure coordinates (lat, lng) are accurate for Seoul/Gyeonggi.
    Make the recommendations diverse and popular for families with children.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);
    const filePath = path.join(__dirname, '../src/assets/data.json');
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Successfully updated data.json');
  } catch (error) {
    console.error('Error updating data:', error);
    process.exit(1);
  }
}

updateData();
