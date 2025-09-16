import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';

const app = new Hono();

// Security middleware
app.use(secureHeaders());

// CORS middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Additional middleware
app.use(logger());
app.use(prettyJSON());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/search', async (c) => {
  const query = c.req.query('q');
  const limit = c.req.query('limit');
  const userId = c.req.query('userId');

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  try {
    const { performSearch } = await import('./src/search');

    const results = await performSearch({
      query,
      limit: limit ? parseInt(limit) : undefined,
      userId: userId ? parseInt(userId) : undefined,
    });

    return c.json({
      query,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return c.json({ error: 'Search failed' }, 500);
  }
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = process.env.PORT || 3001;

console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
