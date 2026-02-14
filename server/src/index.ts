import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import { apiLimiter, authLimiter } from './middleware/rateLimit';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Apply global rate limit to all /api routes
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter); // stricter for auth

// Routes
import pricingRoutes from './routes/pricing.routes';
import authRoutes from './routes/auth.routes';

import subscriptionRoutes from './routes/subscription.routes';
import adminRoutes from './routes/admin.routes';

app.use('/api/pricing', pricingRoutes);
app.use('/api/auth', authRoutes);

app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.get('/', (req, res) => {
  res.send('AcadSync API is running');
});

// Database Connection
import User from './models/User';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    const adminEmail = 'admin@acadsync.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('acadsync@96', salt);
        await User.create({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
            organizationType: 'Other'
        });
        console.log('Admin user seeded');
    }
};

// Database Connection
connectDB().then(() => {
    seedAdmin();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Routes initialized: /api/subscription');
});
