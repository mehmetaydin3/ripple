const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  getMe: () => request<any>('/auth/me'),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),

  // Feed
  getFeed: (page = 1) => request<any>(`${BASE}/feed?page=${page}`),
  getFollowingFeed: (page = 1) => request<any>(`${BASE}/feed/following?page=${page}`),

  // Orgs
  getOrgs: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<any>(`${BASE}/orgs${q ? `?${q}` : ''}`);
  },
  getTrendingOrgs: () => request<any>(`${BASE}/orgs/trending`),
  getOrg: (slug: string) => request<any>(`${BASE}/orgs/${slug}`),
  getOrgFeed: (slug: string, page = 1) => request<any>(`${BASE}/orgs/${slug}/feed?page=${page}`),
  getOrgRipples: (slug: string) => request<any>(`${BASE}/orgs/${slug}/ripples`),

  // Actions
  createAction: (data: any) =>
    request<any>(`${BASE}/actions`, { method: 'POST', body: JSON.stringify(data) }),
  reactToAction: (id: string, type: string) =>
    request<any>(`${BASE}/actions/${id}/react`, { method: 'POST', body: JSON.stringify({ type }) }),

  // Ripples
  getRipples: (page = 1) => request<any>(`${BASE}/ripples?page=${page}`),
  getRipple: (id: string) => request<any>(`${BASE}/ripples/${id}`),
  createRipple: (data: any) =>
    request<any>(`${BASE}/ripples`, { method: 'POST', body: JSON.stringify(data) }),
  joinRipple: (id: string, data: any) =>
    request<any>(`${BASE}/ripples/${id}/join`, { method: 'POST', body: JSON.stringify(data) }),

  // Users
  getUser: (id: string) => request<any>(`${BASE}/users/${id}`),
  getMyProfile: () => request<any>(`${BASE}/users/me/profile`),
  updateMyProfile: (data: any) =>
    request<any>(`${BASE}/users/me/profile`, { method: 'PUT', body: JSON.stringify(data) }),
  followUser: (id: string) =>
    request<any>(`${BASE}/users/${id}/follow`, { method: 'POST' }),
};
