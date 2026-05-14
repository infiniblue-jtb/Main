import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS 허용 (모든 요청에 대해 적용)
app.use('*', cors())

// 상태 확인용 루트 경로
app.get('/', (c) => c.text('Dongtan API is running!'))

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

// 게시글 작성
app.post('/api/posts', async (c) => {
  const authHeader = c.req.header('Authorization');
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
    const result = await c.env.DB.prepare(
      "DELETE FROM posts WHERE id = ?"
    ).bind(id).run();
    
    if (result.meta && result.meta.changes === 0) {
      return c.json({ error: `Post with ID ${id} not found` }, 404);
    }
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

// 하위 호환성을 위해 /api 없이도 작동하도록 추가
app.get('/posts', (c) => c.redirect('/api/posts'))
app.delete('/posts/:id', (c) => {
  const id = c.req.param('id')
  return c.redirect(`/api/posts/${id}`, 307)
})

// 오류 핸들러
app.onError((err, c) => {
  console.error(`Worker Error: ${err.message}`);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error'
  }, 500);
});

// 404 핸들러
app.notFound((c) => {
  console.log(`Worker 404: ${c.req.method} ${c.req.path}`);
  return c.json({
    success: false,
    error: `API Route Not Found: ${c.req.method} ${c.req.path}`
  }, 404);
});

export default app
