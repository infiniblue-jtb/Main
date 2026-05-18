import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// 모든 요청에 대해 로그 출력 및 CORS 적용
app.use('*', async (c, next) => {
  console.log(`[REQUEST] ${c.req.method} ${c.req.path}`);
  const res = await cors()(c, next);
  return res;
});

// 상태 확인
app.get('/', (c) => c.text('Dongtan API is live and well!'))
app.get('/health', (c) => c.json({ status: 'ok', worker: 'dongtan-api' }))

/**
 * 게시글 API 라우트 정의
 * app.route 사용 시 발생하는 경로 매칭 문제를 방지하기 위해 
 * 메인 앱 인스턴스에 직접 정의합니다.
 */

// 1. 목록 조회
const getPosts = async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM posts ORDER BY created_at DESC"
    ).all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: e.message, stage: 'list' }, 500);
  }
};
app.get('/api/posts', getPosts);
app.get('/posts', getPosts);

// 2. 일괄 삭제 (상세 경로 :id 보다 먼저 정의)
const batchDeletePosts = async (c) => {
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
};
app.post('/api/posts/batch-delete', batchDeletePosts);
app.post('/posts/batch-delete', batchDeletePosts);

// 3. 게시글 작성
const createPost = async (c) => {
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
};
app.post('/api/posts', createPost);
app.post('/posts', createPost);

// 4. 단일 항목 삭제
const deletePost = async (c) => {
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
};
app.delete('/api/posts/:id', deletePost);
app.delete('/posts/:id', deletePost);

// 5. 단일 항목 수정
const updatePost = async (c) => {
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
};
app.put('/api/posts/:id', updatePost);
app.put('/posts/:id', updatePost);

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
