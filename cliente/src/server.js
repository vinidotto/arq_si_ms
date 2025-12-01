require('dotenv').config();
const express = require("express");
const clienteRoutes = require("./routes/cliente_routes");
const { limiter, payloadLimiter } = require("./middleware/rateLimiter");
const { cacheMiddleware } = require("./middleware/redisCache");

const app = express();
const PORT = process.env.PORT || 3001; 

app.set('trust proxy', 1);
app.use(payloadLimiter);
app.use(express.json());
app.use(limiter);

// Cache para GET /api/clients/:id com TTL de 1 dia (86400 segundos)
app.get(/^\/api\/clients\/[^/]+$/, cacheMiddleware(86400));

app.use("/api", clienteRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor de Clientes rodando na porta ${PORT}`);
});
