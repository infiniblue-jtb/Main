export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...cors } });

    const requireAuth = () => {
      const auth = request.headers.get('Authorization');
      return auth === `Bearer ${env.API_SECRET}`;
    };

    try {
      // ─── 핀볼 리더보드 ─────────────────────────────
      if (path === '/api/pinball/scores') {
        if (request.method === 'GET') {
          await env.DB.prepare(
            `CREATE TABLE IF NOT EXISTS pinball_scores (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               score INTEGER NOT NULL,
               created_at TEXT DEFAULT (datetime('now'))
             )`
          ).run();
          const { results } = await env.DB.prepare(
            `SELECT name, score FROM pinball_scores ORDER BY score DESC LIMIT 10`
          ).all();
          return json(results);
        }
        if (request.method === 'POST') {
          await env.DB.prepare(
            `CREATE TABLE IF NOT EXISTS pinball_scores (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               name TEXT NOT NULL,
               score INTEGER NOT NULL,
               created_at TEXT DEFAULT (datetime('now'))
             )`
          ).run();
          const { name, score } = await request.json();
          if (!name || typeof score !== 'number') return json({ error: 'invalid' }, 400);
          await env.DB.prepare(
            `INSERT INTO pinball_scores (name, score) VALUES (?, ?)`
          ).bind(String(name).slice(0, 20), Math.floor(score)).run();
          return json({ success: true }, 201);
        }
      }

      // ─── 블로그 포스트 ─────────────────────────────
      if (path === '/api/posts' || path.startsWith('/api/posts/')) {
        if (request.method === 'GET') {
          const { results } = await env.DB.prepare(
            `SELECT * FROM posts ORDER BY created_at DESC LIMIT 30`
          ).all();
          return json(results);
        }

        if (!requireAuth()) return new Response('Unauthorized', { status: 401, headers: cors });

        if (request.method === 'POST') {
          if (path === '/api/posts/batch-delete') {
            const { ids } = await request.json();
            for (const id of ids) {
              await env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run();
            }
            return json({ success: true });
          }
          const { title, content, excerpt, category, image_url } = await request.json();
          await env.DB.prepare(
            `INSERT INTO posts (title, content, excerpt, category, image_url, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'))`
          ).bind(title, content, excerpt || '', category || '', image_url || '').run();
          return json({ success: true }, 201);
        }

        if (request.method === 'PUT') {
          const id = path.split('/').pop();
          const { title, content, excerpt, category, image_url } = await request.json();
          await env.DB.prepare(
            `UPDATE posts SET title=?, content=?, excerpt=?, category=?, image_url=? WHERE id=?`
          ).bind(title, content, excerpt || '', category || '', image_url || '', id).run();
          return json({ success: true });
        }

        if (request.method === 'DELETE') {
          const id = path.split('/').pop();
          await env.DB.prepare(`DELETE FROM posts WHERE id = ?`).bind(id).run();
          return json({ success: true });
        }
      }

      // ─── 이미지 업로드 ─────────────────────────────
      if (path === '/api/upload' && request.method === 'POST') {
        if (!requireAuth()) return new Response('Unauthorized', { status: 401, headers: cors });
        const fd = await request.formData();
        const file = fd.get('image');
        if (!file) return json({ error: 'no file' }, 400);
        const key = `images/${Date.now()}-${file.name}`;
        await env.R2?.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
        return json({ url: `https://dongtan-api.infiniblue.workers.dev/api/images/${key}` });
      }

      // ─── 방문자 통계 ─────────────────────────────
      if (path === '/api/stats/visit' && request.method === 'POST') {
        await env.DB.prepare(
          `CREATE TABLE IF NOT EXISTS stats (key TEXT PRIMARY KEY, value INTEGER DEFAULT 0)`
        ).run();
        await env.DB.prepare(
          `INSERT INTO stats (key, value) VALUES ('visitors', 1)
           ON CONFLICT(key) DO UPDATE SET value = value + 1`
        ).run();
        const row = await env.DB.prepare(`SELECT value FROM stats WHERE key='visitors'`).first();
        return json({ count: row?.value || 0 });
      }

      if (path === '/api/stats/visitors' && request.method === 'GET') {
        const row = await env.DB.prepare(`SELECT value FROM stats WHERE key='visitors'`).first();
        return json({ count: row?.value || 0 });
      }

      return new Response('Not Found', { status: 404, headers: cors });
    } catch (e) {
      return new Response(e.message, { status: 500, headers: cors });
    }
  }
};
