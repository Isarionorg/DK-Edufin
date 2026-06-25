const TOKEN_KEY = 'dk_admin_token';

export const getAdminToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
};

export const setAdminToken = (token: string): void => {
  sessionStorage.setItem(TOKEN_KEY, token);
};

export const clearAdminToken = (): void => {
  sessionStorage.removeItem(TOKEN_KEY);
};

export const isAdminLoggedIn = (): boolean => {
  return !!getAdminToken();
};