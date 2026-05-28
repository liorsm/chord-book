import { fetchTab4uSongContent } from './src/utils/tab4uServer.js';

function attachTab4uProxy(server) {
  server.middlewares.use('/api/tab4u/import', async (req, res, next) => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const url = new URL(req.url || '', 'http://localhost');
    const title = url.searchParams.get('title')?.trim() || '';
    const artist = url.searchParams.get('artist')?.trim() || '';

    if (!title && !artist) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'missing title or artist' }));
      return;
    }

    try {
      const result = await fetchTab4uSongContent(title, artist);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify(
          result || { content: null, sourceUrl: null, error: 'not_found' }
        )
      );
    } catch (err) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          content: null,
          error: err.message || 'tab4u_fetch_failed',
        })
      );
    }
  });
}

export function tab4uImportProxy() {
  return {
    name: 'tab4u-import-proxy',
    configureServer(server) {
      attachTab4uProxy(server);
    },
    configurePreviewServer(server) {
      attachTab4uProxy(server);
    },
  };
}
