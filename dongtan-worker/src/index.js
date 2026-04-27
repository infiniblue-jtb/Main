export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 모든 POST 요청 허용 (경로 무관하게 처리하여 라우팅 에러 방지)
    if (request.method === 'POST') {
      const auth = request.headers.get('Authorization');
      if (auth !== `Bearer ${env.API_SECRET}`) {
        return new Response('Unauthorized', { status: 401 });
      }

      try {
        const { title, content, excerpt } = await request.json();
        await env.DB.prepare(
          `INSERT INTO posts (title, content, excerpt, created_at)
           VALUES (?, ?, ?, datetime('now'))`
        ).bind(title, content, excerpt).run();
        
        return new Response(JSON.stringify({ success: true }), {
          status: 201,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          }
        });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }

    // 모든 GET 요청 허용
    if (request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          `SELECT * FROM posts ORDER BY created_at DESC LIMIT 20`
        ).all();
        return new Response(JSON.stringify(results), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' 
          }
        });
      } catch (e) {
        return new Response(e.message, { status: 500 });
      }
    }

    return new Response('Method Not Allowed', { status: 405 });
  }
};
