import 'dotenv/config';
import express from 'express';
import cors from 'cors';

// Initialize database connection (Singleton pattern)
import './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'https://apply-manager-eosin.vercel.app'
    ];
    // Allow if origin is in the list or if there is no origin (e.g. server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, true); // Temporarily allow all for debugging, replace with Error later if needed
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
import applicationsRouter from './routes/applications.js';
app.use('/api/applications', applicationsRouter);

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
