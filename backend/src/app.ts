import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

import authRouter from './routes/auth.routes';
import studentRouter from './routes/student.routes';
import attendanceRouter from './routes/attendance.routes';
import quranSessionRouter from './routes/quran-session.routes';
import financeRouter from './routes/finance.routes';

// TODO: Add routers here
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/quran-sessions', quranSessionRouter);
app.use('/api/v1/finance', financeRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

export default app;
