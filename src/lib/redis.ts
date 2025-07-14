import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Controllo delle variabili d'ambiente
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  console.error('❌ Variabili d\'ambiente Redis mancanti:');
  console.error('UPSTASH_REDIS_REST_URL:', redisUrl ? '✓ Presente' : '❌ Mancante');
  console.error('UPSTASH_REDIS_REST_TOKEN:', redisToken ? '✓ Presente' : '❌ Mancante');
}

// Configura Redis solo se le variabili sono presenti
export const redis = redisUrl && redisToken ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Rate limit: 3 richieste per minuto per IP
export const ratelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
}) : null;

// Rate limit per email: 1 richiesta per ora per email
export const emailRatelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(1, '1 h'),
  analytics: true,
}) : null; 