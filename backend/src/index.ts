import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';

import machineRoutes from './routes/machineRoutes';
import userRoutes from './routes/userRoutes';
import queueRoutes from './routes/queueRoutes';
import adminRoutes from './routes/adminRoutes';
import { startCronJobs } from './services/cronService';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Pinger route (Sunucuyu ayakta tutmak için)
app.get('/ping', (req: Request, res: Response) => {
  res.send('Pong! Sunucu ayakta.');
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Laundry Tracking API is running.' });
});

// Routes
app.use('/api/machines', machineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/machines/:id/queue', queueRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  startCronJobs();
});
