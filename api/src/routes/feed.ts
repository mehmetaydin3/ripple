import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = Router();

const actionInclude = {
  user: true,
  org: true,
  ripple: {
    include: { startedBy: true, org: true },
  },
  reactions: {
    include: { user: true },
  },
};

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [actions, total] = await Promise.all([
    prisma.action.findMany({
      where: { isPublic: true },
      include: actionInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.action.count({ where: { isPublic: true } }),
  ]);

  res.json({
    data: actions,
    total,
    page,
    limit,
    hasMore: skip + actions.length < total,
  });
});

router.get('/following', requireAuth, async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const following = await prisma.follow.findMany({
    where: { followerId: req.user!.id },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  const [actions, total] = await Promise.all([
    prisma.action.findMany({
      where: {
        userId: { in: followingIds },
        isPublic: true,
      },
      include: actionInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.action.count({
      where: {
        userId: { in: followingIds },
        isPublic: true,
      },
    }),
  ]);

  res.json({
    data: actions,
    total,
    page,
    limit,
    hasMore: skip + actions.length < total,
  });
});

export default router;
