import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// 모든 요청에 대해 로그 출력 및 CORS 적용
app.use('*', async (c, next) => {
  console.log(`[REQUEST] ${c.req.method} ${c.req.url}`);
  const res = await cors()(c, next);
  return res;
});

// 상태 확인
app.get('/', (c) => c.text('Dongtan API is live and well!'))
app.get('/health', (c) => c.json({ status: 'ok', worker: 'dongtan-api' }))

// 게시글 API 그룹화 (경로 유연성 제공)
// /api/posts, /posts, /api/posts/1, /posts/1 모두 대응
const postsApi = new Hono()

// 목록 조회
postsApi.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM posts ORDER BY created_at DESC"
    ).all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: e.message, stage: 'list' }, 500);
  }
});

// 게시글 작성
postsApi.post('/', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized', stage: 'auth' }, 401);
  }
  try {
    const body = await c.req.json();
    const { title, content, excerpt, image_url } = body;
    await c.env.DB.prepare(
      "INSERT INTO posts (title, content, excerpt, image_url) VALUES (?, ?, ?, ?)"
    ).bind(title, content, excerpt, image_url).run();
    return c.json({ success: true }, 201);
  } catch (e) {
    return c.json({ error: e.message, stage: 'create' }, 500);
  }
});

// 일괄 삭제 (ID 상세 경로보다 먼저 정의해야 함)
postsApi.post('/batch-delete', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized', stage: 'auth-batch' }, 401);
  }
  try {
    const { ids } = await c.req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return c.json({ error: 'No IDs provided' }, 400);
    }
    const statements = ids.map(id => 
      c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id)
    );
    await c.env.DB.batch(statements);
    return c.json({ success: true, count: ids.length });
  } catch (e) {
    return c.json({ error: e.message, stage: 'batch-delete' }, 500);
  }
});

// 단일 항목 조작 (ID)
postsApi.delete('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized', stage: 'auth-delete' }, 401);
  }
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare(
      "DELETE FROM posts WHERE id = ?"
    ).bind(id).run();
    
    if (result.meta && result.meta.changes === 0) {
      return c.json({ error: `Post ${id} not found in DB`, success: false }, 404);
    }
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message, stage: 'delete' }, 500);
  }
});

postsApi.put('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized', stage: 'auth-update' }, 401);
  }
  const id = c.req.param('id');
  try {
    const body = await c.req.json();
    const { title, content, excerpt, image_url } = body;
    await c.env.DB.prepare(
      "UPDATE posts SET title = ?, content = ?, excerpt = ?, image_url = ? WHERE id = ?"
    ).bind(title, content, excerpt, image_url, id).run();
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message, stage: 'update' }, 500);
  }
});

// 모든 경로 매핑
app.route('/api/posts', postsApi)
app.route('/posts', postsApi)

// 오류 핸들러
app.onError((err, c) => {
  console.error(`[FATAL ERROR] ${err.stack}`);
  return c.json({
    success: false,
    error: `Worker Error: ${err.message}`,
    path: c.req.path
  }, 500);
});

// 404 핸들러
app.notFound((c) => {
  return c.json({
    success: false,
    error: `API Route Not Found: ${c.req.method} ${c.req.path}`,
    suggestion: 'Check if the URL and method are correct.'
  }, 404);
});

export default app
