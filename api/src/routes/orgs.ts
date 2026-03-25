import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { OrgCategory } from '@prisma/client';

const router = Router();

const actionInclude = {
  user: true,
  org: true,
  ripple: { include: { startedBy: true, org: true } },
  reactions: { include: { user: true } },
};

router.get('/', async (req: Request, res: Response) => {
  const { category, sort, search } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (category && category !== 'ALL') {
    where.category = category as OrgCategory;
  }
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { mission: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  let orderBy: any = { totalRaised: 'desc' };
  if (sort === 'trending') orderBy = { weeklyDonors: 'desc' };
  if (sort === 'rating') orderBy = { starRating: 'desc' };
  if (sort === 'newest') orderBy = { createdAt: 'desc' };

  const [orgs, total] = await Promise.all([
    prisma.organization.findMany({ where, orderBy, skip, take: limit }),
    prisma.organization.count({ where }),
  ]);

  res.json({ data: orgs, total, page, limit, hasMore: skip + orgs.length < total });
});

router.get('/trending', async (_req: Request, res: Response) => {
  const orgs = await prisma.organization.findMany({
    where: { trending: true },
    orderBy: { weeklyDonors: 'desc' },
    take: 10,
  });
  res.json(orgs);
});

router.get('/:slug', async (req: Request, res: Response) => {
  const org = await prisma.organization.findUnique({
    where: { slug: req.params.slug },
  });
  if (!org) return res.status(404).json({ error: 'Organization not found' });
  res.json(org);
});

router.get('/:slug/feed', async (req: Request, res: Response) => {
  const org = await prisma.organization.findUnique({
    where: { slug: req.params.slug },
  });
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [actions, total] = await Promise.all([
    prisma.action.findMany({
      where: { orgId: org.id, isPublic: true },
      include: actionInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.action.count({ where: { orgId: org.id, isPublic: true } }),
  ]);

  res.json({ data: actions, total, page, limit, hasMore: skip + actions.length < total });
});

router.get('/:slug/ripples', async (req: Request, res: Response) => {
  const org = await prisma.organization.findUnique({
    where: { slug: req.params.slug },
  });
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const ripples = await prisma.ripple.findMany({
    where: { orgId: org.id, status: 'ACTIVE' },
    include: {
      startedBy: true,
      org: true,
      actions: { include: { user: true }, orderBy: { createdAt: 'asc' }, take: 10 },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(ripples);
});

export default router;
