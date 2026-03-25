import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { ActionType, ReactionType } from '@prisma/client';

const router = Router();

router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { orgId, type, amount, comment, isPublic, rippleId } = req.body;

  if (!orgId || !type) {
    return res.status(400).json({ error: 'orgId and type are required' });
  }

  const validTypes = Object.values(ActionType);
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid action type' });
  }

  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const action = await prisma.action.create({
    data: {
      userId: req.user!.id,
      orgId,
      type,
      amount: amount ? parseFloat(amount) : null,
      comment: comment || null,
      isPublic: isPublic !== false,
      rippleId: rippleId || null,
    },
    include: {
      user: true,
      org: true,
      ripple: { include: { startedBy: true, org: true } },
      reactions: { include: { user: true } },
    },
  });

  // Update user stats
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      totalActions: { increment: 1 },
      totalGiven: amount ? { increment: parseFloat(amount) } : undefined,
      lastActionDate: new Date(),
    },
  });

  // Update org stats
  if (type === ActionType.DONATE && amount) {
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        totalRaised: { increment: parseFloat(amount) },
        totalDonors: { increment: 1 },
        weeklyDonations: { increment: parseFloat(amount) },
        weeklyDonors: { increment: 1 },
      },
    });
  } else if (type === ActionType.VOLUNTEER) {
    await prisma.organization.update({
      where: { id: orgId },
      data: { totalVolunteers: { increment: 1 } },
    });
  }

  // Update ripple stats
  if (rippleId && type === ActionType.DONATE && amount) {
    await prisma.ripple.update({
      where: { id: rippleId },
      data: {
        currentAmount: { increment: parseFloat(amount) },
        participantCount: { increment: 1 },
      },
    });
  } else if (rippleId) {
    await prisma.ripple.update({
      where: { id: rippleId },
      data: { participantCount: { increment: 1 } },
    });
  }

  res.status(201).json(action);
});

router.post('/:id/react', requireAuth, async (req: Request, res: Response) => {
  const { type } = req.body;

  if (!type || !Object.values(ReactionType).includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }

  const action = await prisma.action.findUnique({ where: { id: req.params.id } });
  if (!action) return res.status(404).json({ error: 'Action not found' });

  try {
    const reaction = await prisma.reaction.upsert({
      where: {
        actionId_userId_type: {
          actionId: req.params.id,
          userId: req.user!.id,
          type,
        },
      },
      update: {},
      create: {
        actionId: req.params.id,
        userId: req.user!.id,
        type,
      },
      include: { user: true },
    });
    res.json(reaction);
  } catch {
    res.status(409).json({ error: 'Already reacted' });
  }
});

export default router;
