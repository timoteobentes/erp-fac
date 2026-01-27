import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import clienteRoutes from './routes/cliente.routes';
import fornecedorRoutes from './routes/fornecedor.routes';
import emailRoutes from './controllers/email.controller';
import paymentRoutes from './routes/payment.routes';
import subscriptionsRoutes from './routes/subscription.routes';
import produtoRoutes from './routes/produto.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// app.use(express.json({ 
//   limit: '50mb',
//   verify: (req: any, res, buf) => {
//     req.rawBody = buf;
//   }
// }));

// app.use(express.urlencoded({ 
//   extended: true, 
//   limit: '50mb',
//   parameterLimit: 100000 // Aumentar o número de parâmetros também
// }));

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', subscriptionsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', clienteRoutes);
app.use('/api', fornecedorRoutes);
app.use('/api', produtoRoutes);
app.use('/api/email', emailRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor rodando' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});