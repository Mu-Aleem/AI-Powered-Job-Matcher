export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'job_seeker' | 'employer';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function clearToken() {
  localStorage.removeItem('token');
  document.cookie = 'token=; path=/; max-age=0';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}
