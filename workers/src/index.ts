import 'dotenv/config';
import { Worker, Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Weekly reset queue
export const weeklyResetQueue = new Queue('weekly-reset', { connection });

// Streak update queue
export const streakQueue = new Queue('streak-update', { connection });

// Weekly reset worker — resets weeklyDonations and weeklyDonors for all orgs
new Worker(
  'weekly-reset',
  async () => {
    console.log('Running weekly reset...');
    await prisma.organization.updateMany({
      data: { weeklyDonations: 0, weeklyDonors: 0 },
    });

    // Expire old ripples
    await prisma.ripple.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    console.log('Weekly reset complete');
  },
  { connection }
);

// Streak update worker
new Worker(
  'streak-update',
  async (job) => {
    const { userId } = job.data;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.lastActionDate) return;

    const now = new Date();
    const lastAction = new Date(user.lastActionDate);
    const diffDays = Math.floor((now.getTime() - lastAction.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      const newStreak = user.streak + 1;
      await prisma.user.update({
        where: { id: userId },
        data: {
          streak: newStreak,
          longestStreak: Math.max(newStreak, user.longestStreak),
        },
      });
    } else if (diffDays > 1) {
      // Streak broken
      await prisma.user.update({
        where: { id: userId },
        data: { streak: 1 },
      });
    }
  },
  { connection }
);

console.log('🌊 Ripple Workers running');
