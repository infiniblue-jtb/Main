import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS 허용
app.use('/api/*', cors())

// 오류 핸들러 (JSON 형식으로 에러 반환 보장)
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error'
  }, 500);
});

// 404 핸들러
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Not Found'
  }, 404);
});

// 게시글 목록 조회
app.get('/api/posts', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM posts ORDER BY created_at DESC"
    ).all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 게시글 작성 (보안을 위해 Authorization 헤더 확인)
app.post('/api/posts', async (c) => {
  const authHeader = c.req.header('Authorization');
  // API_SECRET은 Wrangler/Cloudflare 대시보드에서 설정 필요
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.json();
  const { title, content, excerpt, image_url } = body;

  try {
    await c.env.DB.prepare(
      "INSERT INTO posts (title, content, excerpt, image_url) VALUES (?, ?, ?, ?)"
    ).bind(title, content, excerpt, image_url).run();
    return c.json({ success: true }, 201);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 게시글 삭제
app.delete('/api/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');

  try {
    await c.env.DB.prepare(
      "DELETE FROM posts WHERE id = ?"
    ).bind(id).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 게시글 일괄 삭제
app.post('/api/posts/batch-delete', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { ids } = await c.req.json();
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: 'No IDs provided' }, 400);
  }

  try {
    // D1 batch()를 사용하여 일괄 처리
    const statements = ids.map(id => 
      c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id)
    );
    await c.env.DB.batch(statements);
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 게시글 수정
app.put('/api/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const body = await c.req.json();
  const { title, content, excerpt, image_url } = body;

  try {
    await c.env.DB.prepare(
      "UPDATE posts SET title = ?, content = ?, excerpt = ?, image_url = ? WHERE id = ?"
    ).bind(title, content, excerpt, image_url, id).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

export default app
