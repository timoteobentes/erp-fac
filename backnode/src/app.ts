import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import clienteRoutes from './routes/cliente.routes';
import fornecedorRoutes from './routes/fornecedor.routes';
import emailRoutes from './controllers/email.controller';
import paymentRoutes from './routes/payment.routes';
import subscriptionsRoutes from './routes/subscription.routes';
import produtoRoutes from './routes/produto.routes';
import estoqueRoutes from './routes/estoque.routes';
import financeiroRoutes from './routes/financeiro.routes';
import vendaRoutes from './routes/venda.routes';
import perfilRoutes from './routes/perfil.routes';
import dashboardRoutes from './routes/dashboard.routes';
import servicoRoutes from './routes/servico.routes';
import nfseRoutes from './routes/nfse.routes';
import { loggerMiddleware } from './middleware/logger';
import { authMiddleware } from './middleware/auth';
import { isolamentoMiddleware } from './middleware/isolamento';

const app = express();
const PORT = process.env.PORT || 3333;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: ['https://app.facoaconta.com.br', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(loggerMiddleware);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 1000,
  message: 'Muitas requisições deste IP, por favor tente novamente em um minuto'
});

// Routes
// Rotas públicas e webhooks contornadas
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/email', emailRoutes);

// Proteção da borda e isolamento (Rate Limit + Autenticação + Multi-Tenant Core)
app.use('/api', apiLimiter, authMiddleware, isolamentoMiddleware);

app.use('/api', subscriptionsRoutes);
app.use('/api', clienteRoutes);
app.use('/api', fornecedorRoutes);
app.use('/api', produtoRoutes);
app.use('/api', estoqueRoutes);
app.use('/api', financeiroRoutes);
app.use('/api', vendaRoutes);
app.use('/api', perfilRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/nfse', nfseRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});