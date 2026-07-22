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
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-applications';
    
    mongoose.connect(uri)
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
