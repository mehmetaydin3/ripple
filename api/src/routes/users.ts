import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/me/profile', requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      actions: {
        where: { isPublic: true },
        include: {
          org: true,
          reactions: { include: { user: true } },
          ripple: { include: { startedBy: true, org: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      ripplesStarted: {
        include: { org: true, startedBy: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { followers: true, following: true },
      },
    },
  });
  res.json(user);
});

router.put('/me/profile', requireAuth, async (req: Request, res: Response) => {
  const { bio, isPublic } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      bio: bio !== undefined ? bio : undefined,
      isPublic: isPublic !== undefined ? isPublic : undefined,
    },
  });
  res.json(user);
});

router.get('/:id', async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      actions: {
        where: { isPublic: true },
        include: {
          org: true,
          reactions: { include: { user: true } },
          ripple: { include: { startedBy: true, org: true } },
          user: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      ripplesStarted: {
        include: { org: true, startedBy: true },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { followers: true, following: true },
      },
    },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  // If profile is private and not the owner, return limited info
  const requestingUserId = (req.user as any)?.id;
  if (!user.isPublic && user.id !== requestingUserId) {
    return res.json({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      isPublic: false,
    });
  }

  res.json(user);
});

router.post('/:id/follow', requireAuth, async (req: Request, res: Response) => {
  const targetId = req.params.id;
  const followerId = req.user!.id;

  if (targetId === followerId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return res.status(404).json({ error: 'User not found' });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetId } },
  });

  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId: targetId } },
    });
    return res.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId, followingId: targetId },
  });

  res.json({ following: true });
});

export default router;
