import 'server-only';

export const sportsOrigin = (
  process.env.SPORTS_INTERNAL_ORIGIN ||
  process.env.NEXT_PUBLIC_SPORTS_ORIGIN ||
  'https://wright-sports.org'
).replace(/\/$/, '');
