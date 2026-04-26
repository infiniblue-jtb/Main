const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function updateNews() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is missing.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash", // 안정적인 2.0 모델 사용
  });

  const prompt = `
    2026년 4월 현재, 대한민국 경기도 '화성시 동탄' 지역의 최신 뉴스나 생활 정보를 바탕으로 블로그 포스트를 3개 작성해줘.
    형식은 반드시 JSON 배열이어야 하며, 다음 필드를 포함해줘:
    [
      {
        "id": 1,
        "title": "뉴스 제목",
        "content": "상세 내용 (3~5문단)",
        "excerpt": "요약",
        "created_at": "2026-04-26T10:00:00Z",
        "image_url": ""
      },
      ...
    ]
    반드시 한국어로 작성해줘.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const newsData = JSON.parse(text);

    const filePath = path.join(__dirname, '../src/assets/news.json');
    fs.writeFileSync(filePath, JSON.stringify(newsData, null, 2));
    
    console.log('Successfully updated news.json with', newsData.length, 'posts');
  } catch (error) {
    console.error('News update failed:', error.message);
    process.exit(1);
  }
}

updateNews();
