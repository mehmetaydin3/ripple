export enum ActionType {
  DONATE = 'DONATE',
  VOLUNTEER = 'VOLUNTEER',
  CHEER = 'CHEER',
  SHARE = 'SHARE',
}

export enum OrgCategory {
  ENVIRONMENT = 'ENVIRONMENT',
  HEALTH = 'HEALTH',
  EDUCATION = 'EDUCATION',
  POVERTY = 'POVERTY',
  ANIMALS = 'ANIMALS',
  DISASTER_RELIEF = 'DISASTER_RELIEF',
  COMMUNITY = 'COMMUNITY',
}

export enum RippleStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

export enum ReactionType {
  CHEER = 'CHEER',
  MATCH = 'MATCH',
}

export interface UserPublic {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  isPublic: boolean;
  streak: number;
  longestStreak: number;
  totalGiven: number;
  totalActions: number;
  joinedAt: string;
}

export interface OrgPublic {
  id: string;
  ein: string | null;
  name: string;
  slug: string;
  mission: string | null;
  description: string | null;
  category: OrgCategory;
  charityNavigatorRating: number | null;
  starRating: number | null;
  percentToPrograms: number | null;
  donateUrl: string | null;
  volunteerUrl: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  coverImageUrl: string | null;
  totalRaised: number;
  totalDonors: number;
  totalVolunteers: number;
  weeklyDonations: number;
  weeklyDonors: number;
  trending: boolean;
  createdAt: string;
}

export interface ActionPublic {
  id: string;
  user: UserPublic;
  org: OrgPublic;
  type: ActionType;
  amount: number | null;
  comment: string | null;
  isPublic: boolean;
  ripple: RipplePublic | null;
  reactions: ReactionPublic[];
  createdAt: string;
}

export interface RipplePublic {
  id: string;
  startedBy: UserPublic;
  org: OrgPublic;
  title: string;
  description: string | null;
  targetAmount: number | null;
  currentAmount: number;
  participantCount: number;
  status: RippleStatus;
  expiresAt: string | null;
  createdAt: string;
}

export interface ReactionPublic {
  id: string;
  user: UserPublic;
  type: ReactionType;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
