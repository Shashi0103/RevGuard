import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import apiRoutes from './routes/apiRoutes';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root route summary
app.get('/', (_req, res) => {
  res.json({
    name: 'RevGuard AI Revenue Recovery Agent API',
    tagline: 'Every lost payment deserves a second chance.',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'ACTIVE'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 RevGuard Backend API running on http://localhost:${PORT}`);
  console.log(`🛡️  Environment: ${process.env.NODE_ENV || 'development'} | Demo Mode: ${process.env.DEMO_MODE || 'true'}`);
});
