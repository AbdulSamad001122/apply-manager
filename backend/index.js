import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Initialize database connection (Singleton pattern)
import './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Routes
import applicationsRouter from './routes/applications.js';
app.use('/api/applications', applicationsRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
