import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { ActionType } from '@prisma/client';

const router = Router();

const rippleInclude = {
  startedBy: true,
  org: true,
  actions: {
    include: { user: true, reactions: { include: { user: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

router.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [ripples, total] = await Promise.all([
    prisma.ripple.findMany({
      where: { status: 'ACTIVE' },
      include: rippleInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.ripple.count({ where: { status: 'ACTIVE' } }),
  ]);

  res.json({ data: ripples, total, page, limit, hasMore: skip + ripples.length < total });
});

router.get('/:id', async (req: Request, res: Response) => {
  const ripple = await prisma.ripple.findUnique({
    where: { id: req.params.id },
    include: rippleInclude,
  });
  if (!ripple) return res.status(404).json({ error: 'Ripple not found' });
  res.json(ripple);
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { orgId, title, description, targetAmount, expiresAt } = req.body;

  if (!orgId || !title) {
    return res.status(400).json({ error: 'orgId and title are required' });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const ripple = await prisma.ripple.create({
    data: {
      startedByUserId: req.user!.id,
      orgId,
      title,
      description: description || null,
      targetAmount: targetAmount ? parseFloat(targetAmount) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
    include: rippleInclude,
  });

  res.status(201).json(ripple);
});

router.post('/:id/join', requireAuth, async (req: Request, res: Response) => {
  const ripple = await prisma.ripple.findUnique({ where: { id: req.params.id } });
  if (!ripple) return res.status(404).json({ error: 'Ripple not found' });
  if (ripple.status !== 'ACTIVE') return res.status(400).json({ error: 'Ripple is not active' });

  const { amount, comment, type } = req.body;
  const actionType = type || ActionType.DONATE;

  const action = await prisma.action.create({
    data: {
      userId: req.user!.id,
      orgId: ripple.orgId,
      type: actionType,
      amount: amount ? parseFloat(amount) : null,
      comment: comment || null,
      isPublic: true,
      rippleId: ripple.id,
    },
    include: {
      user: true,
      org: true,
      ripple: { include: { startedBy: true, org: true } },
      reactions: { include: { user: true } },
    },
  });

  await prisma.ripple.update({
    where: { id: ripple.id },
    data: {
      participantCount: { increment: 1 },
      currentAmount: amount ? { increment: parseFloat(amount) } : undefined,
    },
  });

  res.status(201).json(action);
});

export default router;
