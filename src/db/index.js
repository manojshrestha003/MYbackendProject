import mongoose from 'mongoose';
//connect  to the database  moogoose.connect 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error; // Re-throw the error after logging
  }
};

export default connectDB;
