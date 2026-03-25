import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../lib/prisma';

const router = Router();

declare global {
  namespace Express {
    interface User {
      id: string;
      googleId: string;
      name: string;
      avatar: string | null;
      bio: string | null;
      isPublic: boolean;
      streak: number;
      longestStreak: number;
      totalGiven: number;
      totalActions: number;
      joinedAt: Date;
    }
  }
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: `${process.env.API_URL}/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: {
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value ?? null,
            },
            create: {
              googleId: profile.id,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value ?? null,
            },
          });
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || undefined);
  } catch (err) {
    done(err);
  }
});

router.get('/google', (req: Request, res: Response, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id') {
    return res.status(503).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req: Request, res: Response, next) => {
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` })(req, res, () => {
    const returnTo = (req.session as any).returnTo || process.env.FRONTEND_URL;
    delete (req.session as any).returnTo;
    res.redirect(returnTo);
  });
});

router.get('/me', (req: Request, res: Response) => {
  if (!req.user) return res.json(null);
  res.json(req.user);
});

router.post('/logout', (req: Request, res: Response) => {
  req.logout(() => {
    res.json({ ok: true });
  });
});

export default router;
