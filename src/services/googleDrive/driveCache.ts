interface CachedItem<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'learnos_drive_cache_';
const DEFAULT_TTL_MS = 1000 * 60 * 30; // 30 minutes

export const getCachedData = <T>(key: string, maxAgeMs: number = DEFAULT_TTL_MS): T | null => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const item: CachedItem<T> = JSON.parse(raw);
    const now = Date.now();

    if (now - item.timestamp > maxAgeMs) {
      // Stale
      return null;
    }

    return item.data;
  } catch (e) {
    return null;
  }
};

export const setCachedData = <T>(key: string, data: T): void => {
  try {
    const item: CachedItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (e) {
    console.warn('Failed to cache Drive data in localStorage:', e);
  }
};

export const clearDriveCache = (): void => {
  try {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  } catch (e) {
    console.error('Error clearing drive cache:', e);
  }
};
