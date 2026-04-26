const { GoogleGenerativeAI } = require('@google/generative-ai');

async function updateNews() {
  const apiKey = process.env.GEMINI_API_KEY;
  const workerApiUrl = process.env.WORKER_API_URL; // Cloudflare Worker 주소
  const apiSecret = process.env.API_SECRET; // 보안용 시크릿 키

  if (!apiKey || !workerApiUrl) {
    console.error('ERROR: Missing environment variables.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // 최신 모델로 변경
  });

  const prompt = `
    2026년 4월 현재, 대한민국 경기도 '화성시 동탄' 지역의 최신 뉴스나 생활 정보를 바탕으로 블로그 포스트를 작성해줘.
    형식은 JSON이어야 하며, 다음 필드를 포함해줘:
    {
      "title": "뉴스 제목 (예: 동탄 호수공원 봄 축제 일정 안내)",
      "content": "뉴스 상세 내용 (블로그 포스트 스타일로 3~5문단)",
      "excerpt": "뉴스 요약 (1~2문장)"
    }
    반드시 한국어로 작성하고, 정보가 정확하지 않다면 동탄 주민들에게 유용한 '생활 정보'나 '주말 가볼만한 곳'을 테마로 작성해줘.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, ''); // 마크다운 제거
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
