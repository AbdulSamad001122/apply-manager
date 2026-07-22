import mongoose from 'mongoose';

class Database {
  constructor() {
    if (!Database.instance) {
      this._connect();
      Database.instance = this;
    }
    return Database.instance;
  }

  _connect() {
    const uri = process.env.MONGODB_URI;
    
    if (!uri && process.env.NODE_ENV !== 'development') {
      console.error('FATAL ERROR: MONGODB_URI environment variable is not defined.');
      // Don't try localhost in production/Vercel
    }
    
    const connectUri = uri || 'mongodb://localhost:27017/job-applications';

    mongoose.connect(connectUri, {
      serverSelectionTimeoutMS: 3000 // Fail after 3 seconds instead of hanging for 10s
    })
      .then(() => {
        console.log('Database connection successful');
      })
      .catch(err => {
        console.error('Database connection error:', err);
      });
  }
}

const instance = new Database();
Object.freeze(instance);

export default instance;
