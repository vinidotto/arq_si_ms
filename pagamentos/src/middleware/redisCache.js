const redis = require('redis');

let client;

async function initializeRedis() {
  client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'redis',
      port: process.env.REDIS_PORT || 6379,
    }
  });

  client.on('error', (err) => {
    console.error('Erro ao conectar ao Redis:', err);
  });

  client.on('connect', () => {
    console.log('✓ Conectado ao Redis');
  });

  try {
    await client.connect();
  } catch (err) {
    console.error('Erro ao conectar Redis:', err);
  }
}

// Middleware para cachear GET requests com Redis
const cacheMiddleware = (ttlSeconds) => {
  return async (req, res, next) => {
    // Apenas cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (!client) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      // Tentar buscar do cache
      const cachedData = await client.get(key);
      
      if (cachedData) {
        try {
          res.set('X-Cache', 'HIT');
          return res.json(JSON.parse(cachedData));
        } catch (e) {
          console.error('Erro ao parsear cache:', e);
          return next();
        }
      }

      // Interceptar response.json para cachear
      const originalJson = res.json.bind(res);
      res.json = async function (body) {
        if (res.statusCode === 200) {
          try {
            if (ttlSeconds === -1) {
              // Sem expiração (infinito)
              await client.set(key, JSON.stringify(body));
            } else {
              // Com TTL
              await client.setEx(key, ttlSeconds, JSON.stringify(body));
            }
            console.log(`[CACHE SET] ${key} (TTL: ${ttlSeconds}s)`);
          } catch (err) {
            console.error('Erro ao salvar no cache:', err);
          }
        }
        res.set('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Erro no cache middleware:', err);
      next();
    }
  };
};

// Inicializar Redis ao carregar o módulo
initializeRedis().catch(err => {
  console.error('Falha ao inicializar Redis:', err);
});

module.exports = {
  cacheMiddleware,
  initializeRedis,
};
