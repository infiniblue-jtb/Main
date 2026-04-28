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
    model: "gemini-2.5-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    Generate a JSON object with the following EXACT structure. 
    Return ONLY the raw JSON without any markdown formatting or backticks.
    
    The area MUST be limited to 'Dongtan New Town (Dongtan 1 & 2), Hwaseong-si, Gyeonggi-do, South Korea'.
    All place names and descriptions must be real and accurate for the Dongtan area.

    {
      "kids": {
        "free": [ { "name": "장소명", "name_en": "Place Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "price": "무료", "price_en": "Free", "parking": "주차 정보" }, ... (6 items total) ],
        "paid": [ { "name": "장소명", "name_en": "Place Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "price": "가격 정보", "price_en": "Price Info", "parking": "주차 정보" }, ... (6 items total) ]
      },
      "food": {
        "breakfast": [ { "name": "식당명", "name_en": "Restaurant Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "menu": "대표메뉴", "menu_en": "Main Menu", "parking": "주차 정보" }, ... (4 items total) ],
        "lunch": [ { "name": "식당명", "name_en": "Restaurant Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "menu": "대표메뉴", "menu_en": "Main Menu", "parking": "주차 정보" }, ... (4 items total) ],
        "dinner": [ { "name": "식당명", "name_en": "Restaurant Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "menu": "대표메뉴", "menu_en": "Main Menu", "parking": "주차 정보" }, ... (4 items total) ]
      },
      "cafe": [
        { "name": "카페명", "name_en": "Cafe Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "feature": "아이 동반 특징", "feature_en": "Kid-friendly feature", "parking": "주차 정보" }, ... (6 items total)
      ],
      "health": {
        "hospitals": [ { "name": "병원명", "name_en": "Hospital Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "time": "운영시간", "time_en": "Operating Hours", "info": "특이사항(예: 달빛어린이병원)", "info_en": "Details" }, ... (3 items total) ],
        "pharmacies": [ { "name": "약국명", "name_en": "Pharmacy Name", "lat": 37.0, "lng": 127.0, "address": "도로명 주소", "time": "운영시간", "time_en": "Operating Hours", "info": "특이사항(예: 심야약국)", "info_en": "Details" }, ... (3 items total) ]
      }
    }

    IMPORTANT: 
    - Locations MUST be in Dongtan (동탄).
    - Coordinate (lat, lng) must be accurate for the given address.
    - Do NOT include markdown blocks like \`\`\`json.
    - Language: name, address, menu, feature, info, parking must be in Korean. English fields (name_en, price_en, etc.) must be in English.
  \`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
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
