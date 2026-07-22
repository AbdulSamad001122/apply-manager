import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  postLink: {
    type: String,
    required: true,
  },
  accountLink: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.model('Application', applicationSchema);
