import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import workerRoutes from './routes/workerRoutes';
import chatRoutes from './routes/chatRoutes';
import orderRoutes from './routes/orderRoutes';
import jobRoutes from './routes/jobRoutes';
import aiRoutes from './routes/aiRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { initBot } from './telegram/bot';

const app = express();
const PORT = process.env.PORT || 5000;

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mastero API',
      version: '1.0.0',
      description: 'API documentation for Mastero platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());

// Webhook must be BEFORE express.json() because it needs the raw body
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('Mastero API is running...');
});

// Start Telegram Bot
initBot();

app.listen(PORT, () => {
  console.log(`✅ Mastero Server started: http://localhost:${PORT}`);
});