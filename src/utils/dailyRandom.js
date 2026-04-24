export function getDailySeed(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return Number(`${year}${month}${day}`);
}

export function hashToSeed(value = '') {
  let hash = 2166136261;
  const text = String(value);

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed) {
  let state = (seed >>> 0) || 1;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(items, seed) {
  const arr = [...items];
  const random = createSeededRandom(seed);

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

export function getDailyReviews(reviewPool, options = {}) {
  const { count = 4, seed = getDailySeed(), source = '' } = options;
  const scoped = source ? reviewPool.filter((item) => item.source === source) : reviewPool;
  const dailySeed = (seed ^ hashToSeed(source || 'all')) >>> 0;
  return seededShuffle(scoped, dailySeed).slice(0, count);
}

export function formatReviewDate(daysAgo, now = new Date()) {
  const date = new Date(now);
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - Math.max(0, daysAgo || 0));

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getMsUntilNextMidnight(now = new Date()) {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(1000, nextMidnight.getTime() - now.getTime());
}
