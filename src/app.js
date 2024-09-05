import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';

// Load environment variables from .env file
dotenv.config({ path: './.env' });

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Ensure this is set correctly in your .env file
    credentials: true // Allow cookies to be sent and received
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Correctly use router with the full path prefix
app.use('/api/v1/user', userRouter);


export {app}