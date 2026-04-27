const { GoogleGenerativeAI } = require('@google/generative-ai');

async function updateNews() {
  const apiKey = process.env.GEMINI_API_KEY;
  let workerApiUrl = process.env.WORKER_API_URL ? process.env.WORKER_API_URL.trim() : null;
  const apiSecret = process.env.API_SECRET ? process.env.API_SECRET.replace(/\s/g, '') : null;

  if (!apiKey || !workerApiUrl || !apiSecret) {
    console.error('ERROR: Missing environment variables (API_KEY, WORKER_URL, or API_SECRET).');
    process.exit(1);
  }

  // URL 프로토콜 확인 및 수정
  if (!workerApiUrl.startsWith('http')) {
    workerApiUrl = `https://${workerApiUrl}`;
  }
  workerApiUrl = workerApiUrl.replace(/\/$/, '');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite", 
  });

  const prompt = `
    2026년 4월 현재, 대한민국 경기도 '화성시 동탄' 지역의 최신 뉴스나 생활 정보를 바탕으로 블로그 포스트를 작성해줘.
    형식은 JSON이어야 하며, 다음 필드를 포함해줘:
    {
      "title": "뉴스 제목",
      "content": "상세 내용 (3~5문단)",
      "excerpt": "요약 (1~2문장)"
    }
    반드시 한국어로 작성해줘.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, '').trim();
    const newsData = JSON.parse(text);

    console.log('Generated News:', newsData.title);

    // Cloudflare Worker API로 전송하여 D1에 저장
    const apiResponse = await fetch(`${workerApiUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiSecret}`
      },
      body: JSON.stringify(newsData)
    });

    if (apiResponse.ok) {
      console.log('Successfully saved to D1 Database');
    } else {
      const errorText = await apiResponse.text();
      throw new Error(`API failed: ${errorText}`);
    }

  } catch (error) {
    console.error('News update failed:', error.message);
    process.exit(1);
  }
}

updateNews();
