const rateLimit = require('express-rate-limit');

// Rate limiter: 10 requests por minuto
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // Limite de 10 requests
  message: 'Você excedeu o limite de requisições. Máximo 10 requisições por minuto.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para validar tamanho máximo de 200kb
const payloadLimiter = (req, res, next) => {
  const maxSize = 200 * 1024; // 200kb em bytes
  let size = 0;

  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > maxSize) {
      req.connection.destroy();
      return res.status(413).json({
        message: `Payload muito grande. Máximo permitido: 200kb, Recebido: ${(size / 1024).toFixed(2)}kb`
      });
    }
  });

  next();
};

module.exports = {
  limiter,
  payloadLimiter,
};
