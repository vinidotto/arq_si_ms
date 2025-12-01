const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Redis: Máximo de tentativas de reconexão atingido');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      console.error('Redis Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis: Conectado com sucesso');
      isRedisConnected = true;
    });

    redisClient.on('ready', () => {
      console.log('Redis: Pronto para uso');
      isRedisConnected = true;
    });

    await redisClient.connect();
  }

  return redisClient;
};

const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {

    if (req.method !== 'GET') {
      return next();
    }

    try {
      const client = await getRedisClient();

      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : `cache:${req.baseUrl}${req.path}:${JSON.stringify(req.query)}`;

      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`Cache MISS: ${cacheKey}`);

      const originalJson = res.json.bind(res);

      res.json = (data) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const saveToCache = async () => {
            try {
              if (ttl === null) {
                await client.set(cacheKey, JSON.stringify(data));
              } else {
                await client.setEx(cacheKey, ttl, JSON.stringify(data));
              }
              console.log(`Cache : ${cacheKey} (TTL: ${ttl === null ? 'infinito' : ttl + 's'})`);
            } catch (error) {
              console.error('Erro ao salvar no cache:', error);
            }
          };
          saveToCache();
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

const invalidateCache = async (pattern) => {
  try {
    const client = await getRedisClient();
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Cache INVALIDATED: ${keys.length} chaves removidas (${pattern})`);
    }
  } catch (error) {
    console.error('Erro ao invalidar cache:', error);
  }
};

const invalidateResourceCache = async (resourcePath) => {
  await invalidateCache(`cache:${resourcePath}*`);
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  invalidateResourceCache,
  getRedisClient
};
