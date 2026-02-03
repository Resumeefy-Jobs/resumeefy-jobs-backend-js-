import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authroutes.js';
import jobseekerRoutes from './routes/jobseekerroutes.js';
import jobRoutes from './routes/jobroutes.js';
import applicationRoutes from './routes/applicationroutes.js'
import employerRoutes from './routes/employerRoutes.js';
import adminRoutes from './routes/adminroutes.js';
import morgan from 'morgan';  
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

dotenv.config();
const app = express();
app.use(helmet());

app.use(cors({
  origin:  '*', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else {
          if (typeof obj[key] === 'string') {
            obj[key] = obj[key]
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
          }
          sanitize(obj[key]);
        }
      });
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

app.use(hpp());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));  
app.use('/api/auth', authRoutes);
app.use('/api/jobseeker', jobseekerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

connectDB();

app.get('/', (req, res) => {
  res.send('Resumeefy API is running...');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    succeeded: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));