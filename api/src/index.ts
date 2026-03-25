import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import passport from 'passport';
import RedisStore from 'connect-redis';
import { redis } from './lib/redis';

import authRoutes from './routes/auth';
import feedRoutes from './routes/feed';
import orgsRoutes from './routes/orgs';
import actionsRoutes from './routes/actions';
import ripplesRoutes from './routes/ripples';
import usersRoutes from './routes/users';

// Initialize passport strategies
import './routes/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Redis session store
const store = new RedisStore({ client: redis });

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store,
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/orgs', orgsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/ripples', ripplesRoutes);
app.use('/api/users', usersRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`🌊 Ripple API running on http://localhost:${PORT}`);
});

export default app;
