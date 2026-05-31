import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// 표준 CORS 미들웨어 적용
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}))

// 요청 로깅 미들웨어
app.use('*', async (c, next) => {
  console.log(`[${c.req.method}] ${c.req.path}`);
  await next();
});

// 상태 확인 (배포 버전 확인용)
app.get('/health', (c) => c.json({ 
  status: 'ok', 
  worker: 'dongtan-api', 
  version: 'v1.1.0',
  timestamp: new Date().toISOString() 
}))

app.get('/', (c) => c.text('Dongtan API is live!'))

/**
 * 게시글 API
 */

// 1. 일괄 삭제 (ID 매칭보다 우선순위 높임)
app.post('/api/posts/batch-delete', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
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
    return c.json({ error: e.message }, 500);
  }
});

// 2. 목록 조회
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

// 3. 게시글 작성
app.post('/api/posts', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const body = await c.req.json();
    const { title, content } = body;
    await c.env.DB.prepare(
      "INSERT INTO posts (title, content) VALUES (?, ?)"
    ).bind(title, content).run();
    return c.json({ success: true }, 201);
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 4. 게시글 수정
app.put('/api/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const id = c.req.param('id');
  try {
    const { title, content } = await c.req.json();
    const result = await c.env.DB.prepare(
      "UPDATE posts SET title = ?, content = ? WHERE id = ?"
    ).bind(title, content, id).run();
    if (result.meta && result.meta.changes === 0) {
      return c.json({ error: 'Not Found' }, 404);
    }
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 5. 단일 항목 삭제
app.delete('/api/posts/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.API_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const id = c.req.param('id');
  try {
    const result = await c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    if (result.meta && result.meta.changes === 0) {
      return c.json({ error: 'Not Found' }, 404);
    }
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 6. 이미지 업로드 (R2)
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const filename = `${Date.now()}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    await c.env.IMAGES.put(filename, arrayBuffer, {
      httpMetadata: { contentType: file.type || 'image/png' }
    });

    // Worker가 직접 서빙 — 커스텀 도메인 공개 설정 불필요
    const url = `https://dongtan-api.infiniblue.workers.dev/api/images/${filename}`;
    return c.json({ success: true, url });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 7. 이미지 서빙 (R2 → Worker → 브라우저)
app.get('/api/images/:filename', async (c) => {
  const filename = c.req.param('filename');
  try {
    const obj = await c.env.IMAGES.get(filename);
    if (!obj) return c.json({ error: 'Not Found' }, 404);
    const contentType = obj.httpMetadata?.contentType || 'image/png';
    return new Response(obj.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

// 오류 핸들러
app.onError((err, c) => {
  return c.json({
    success: false,
    error: err.message,
    path: c.req.path
  }, 500);
});

// 404 핸들러
app.notFound((c) => {
  return c.json({
    success: false,
    error: `Not Found: ${c.req.method} ${c.req.path}`,
    debug: {
      method: c.req.method,
      path: c.req.path,
      url: c.req.url
    }
  }, 404);
});

export default app
