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
    model: "gemini-2.5-flash-lite", // 성능이 좋은 최신 모델 사용
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    2026년 4월 현재, 대한민국 경기도 '화성시 동탄신도시(1, 2동탄)' 지역의 최신 생활 정보, 뉴스, 행사, 맛집 소식 등을 바탕으로 블로그 포스트 3개를 작성해줘.
    
    각 포스트는 서로 주제가 겹치지 않아야 해 (예: 하나는 교통, 하나는 맛집, 하나는 공원 행사 등).
    
    형식은 반드시 다음 구조를 가진 JSON 배열이어야 해:
    [
      {
        "title": "뉴스 제목",
        "content": "상세 내용 (최소 3문단 이상, 풍부하게 작성)",
        "excerpt": "목록에 표시될 요약 (1~2문장)",
        "image_url": "주제와 어울리는 Unsplash 이미지 URL (예: 공원이면 https://images.unsplash.com/photo-1590604537905-1a84f4705030)"
      },
      ... (총 3개)
    ]
    
    반드시 한국어로 작성하고, 실제 동탄 지역의 특성을 반영해줘.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    const newsArray = JSON.parse(text);

    if (!Array.isArray(newsArray)) {
      throw new Error('Gemini did not return an array.');
    }

    console.log(`Generated ${newsArray.length} posts. Starting upload...`);

    // 각 포스트를 루프 돌며 D1에 저장
    for (const newsData of newsArray) {
      console.log('Uploading:', newsData.title);
      
      const apiResponse = await fetch(`${workerApiUrl}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSecret}`
        },
        body: JSON.stringify(newsData)
      });

      if (apiResponse.ok) {
        console.log(`- Success: ${newsData.title}`);
      } else {
        const errorText = await apiResponse.text();
        console.error(`- Failed: ${newsData.title}`, errorText);
      }
    }

    console.log('All posts processed successfully.');

  } catch (error) {
    console.error('News update failed:', error.message);
    process.exit(1);
  }
}

updateNews();