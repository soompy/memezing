import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import uploadRoutes from './routes/upload';
import authRoutes from './routes/auth';
import memeRoutes from './routes/memes';
import commentRoutes from './routes/comments';
import templateRoutes from './routes/templates';
import socialRoutes from './routes/social';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import analyticsRoutes from './routes/analytics';
import searchRoutes from './routes/search';
import feedRoutes from './routes/feed';
import passport from './config/passport';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/memes', memeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/feed', feedRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: '밈징 API 서버가 정상 작동 중입니다!' });
});

app.listen(PORT, () => {
  console.log(`🚀 밈징 서버가 포트 ${PORT}에서 실행 중입니다!`);
});