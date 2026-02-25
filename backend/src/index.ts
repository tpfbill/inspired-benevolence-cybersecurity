import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { sequelize } from './database/connection';
import logger from './utils/logger';

import authRoutes from './routes/auth';
import playbookRoutes from './routes/playbooks';
import incidentRoutes from './routes/incidents';
import alertRoutes from './routes/alerts';
import userRoutes from './routes/users';
import complianceRoutes from './routes/compliance';
import integrationRoutes from './routes/integrations';
import taskRoutes from './routes/tasks';
import roleRoutes from './routes/roles';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/roles', roleRoutes);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-incident', (incidentId: string) => {
    socket.join(`incident-${incidentId}`);
    logger.info(`Client ${socket.id} joined incident ${incidentId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

export { io };

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    await sequelize.sync({ alter: false });
    logger.info('Database synchronized');

    httpServer.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();
