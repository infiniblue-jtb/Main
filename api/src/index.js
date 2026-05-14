import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// CORS 허용
app.use('*', cors())

// 테스트용 루트 경로
app.get('/', (c) => c.text('Dongtan API is running!'))

// 모든 라우트에 대해 /api 가 있든 없든 처리할 수 있도록 중복 정의하거나 그룹화
const api = new Hono()

// 게시글 목록 조회
api.get('/posts', async (c) => {
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
api.post('/posts', async (c) => {
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
api.delete('/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare(
      "DELETE FROM posts WHERE id = ?"
    ).bind(id).run();
    if (result.meta.changes === 0) {
      return c.json({ error: 'Post not found in database' }, 404);
    }
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 게시글 일괄 삭제
api.post('/posts/batch-delete', async (c) => {
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
api.put('/posts/:id', async (c) => {
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

// 메인 앱에 API 라우트 마운트 (두 가지 경우 모두 대응)
app.route('/api', api)
app.route('/', api)

// 오류 핸들러
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json({
    success: false,
    error: err.message || 'Internal Server Error'
  }, 500);
});

// 404 핸들러
app.notFound((c) => {
  return c.json({
    success: false,
    error: `Not Found: ${c.req.method} ${c.req.path}`
  }, 404);
});

export default app
