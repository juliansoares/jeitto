const express = require('express');
const axios = require('axios');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const client = require('prom-client');

const app = express();
const PORT = 3000;

// Cache simples em memória
const cache = new Map();
const TTL = 60 * 1000; // 60s

// =========================
// Prometheus metrics
// =========================
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duração das requisições HTTP em ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [5, 10, 25, 50, 100, 200, 500, 1000, 2000],
});

const cacheHitsTotal = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total de cache hits',
  labelNames: ['route'],
});

const cacheMissesTotal = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total de cache misses',
  labelNames: ['route'],
});

const externalApiCallsTotal = new client.Counter({
  name: 'external_api_calls_total',
  help: 'Total de chamadas para API externa',
  labelNames: ['target', 'status'],
});

const externalApiErrorsTotal = new client.Counter({
  name: 'external_api_errors_total',
  help: 'Total de erros em chamadas para API externa',
  labelNames: ['target', 'type'],
});

const externalApiDurationMs = new client.Histogram({
  name: 'external_api_duration_ms',
  help: 'Duração da chamada para API externa em ms',
  labelNames: ['target', 'status'],
  buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationMs);
register.registerMetric(cacheHitsTotal);
register.registerMetric(cacheMissesTotal);
register.registerMetric(externalApiCallsTotal);
register.registerMetric(externalApiErrorsTotal);
register.registerMetric(externalApiDurationMs);

// =========================
// Helpers
// =========================
function getRouteLabel(req) {
  if (req.route && req.route.path) return req.route.path;
  return req.path || 'unknown';
}

async function fetchWithRetry(url, retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    const endTimer = externalApiDurationMs.startTimer({
      target: 'hp_api',
    });

    try {
      const response = await axios.get(url, { timeout: 2000 });

      externalApiCallsTotal.inc({
        target: 'hp_api',
        status: String(response.status),
      });

      endTimer({ target: 'hp_api', status: String(response.status) });

      return response;
    } catch (err) {
      lastError = err;

      const status =
        err.response?.status ? String(err.response.status) : 'error';

      externalApiCallsTotal.inc({
        target: 'hp_api',
        status,
      });

      externalApiErrorsTotal.inc({
        target: 'hp_api',
        type: err.code || 'request_error',
      });

      endTimer({ target: 'hp_api', status });

      if (i < retries - 1) {
        await new Promise((res) => setTimeout(res, 200 * (i + 1)));
      }
    }
  }

  throw lastError;
}

// =========================
// Middleware de correlation ID + logs + métricas HTTP
// =========================
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const route = getRouteLabel(req);
    const statusCode = String(res.statusCode);

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    httpRequestDurationMs.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      durationMs
    );

    const log = {
      timestamp: new Date().toISOString(),
      level: 'info',
      correlation_id: correlationId,
      pod: os.hostname(),
      method: req.method,
      path: req.originalUrl,
      route,
      status_code: res.statusCode,
      duration_ms: durationMs,
    };

    console.log(JSON.stringify(log));
  });

  next();
});

// =========================
// Health
// =========================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    pod: os.hostname(),
    correlation_id: req.correlationId,
  });
});

// =========================
// Metrics
// =========================
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// =========================
// Endpoint principal
// =========================
app.get('/wizard/:name', async (req, res) => {
  const name = req.params.name.toLowerCase();

  const cached = cache.get(name);
  if (cached && Date.now() - cached.timestamp < TTL) {
    cacheHitsTotal.inc({ route: '/wizard/:name' });

    return res.json({
      ...cached.data,
      source: 'cache',
      pod: os.hostname(),
      correlation_id: req.correlationId,
    });
  }

  cacheMissesTotal.inc({ route: '/wizard/:name' });

  try {
    const response = await fetchWithRetry(
      'https://hp-api.onrender.com/api/characters'
    );

    const character = response.data.find(
      (c) => c.name && c.name.toLowerCase() === name
    );

    if (!character) {
      return res.status(404).json({
        error: 'Wizard not found',
        pod: os.hostname(),
        correlation_id: req.correlationId,
      });
    }

    cache.set(name, {
      data: character,
      timestamp: Date.now(),
    });

    return res.json({
      ...character,
      source: 'api',
      pod: os.hostname(),
      correlation_id: req.correlationId,
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        correlation_id: req.correlationId,
        pod: os.hostname(),
        message: 'Failed to fetch external API',
        error: error.message,
        path: req.originalUrl,
      })
    );

    return res.status(500).json({
      error: 'Internal server error',
      pod: os.hostname(),
      correlation_id: req.correlationId,
    });
  }
});

// =========================
// Start
// =========================
app.listen(PORT, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Server running on port ${PORT}`,
      pod: os.hostname(),
    })
  );
});
