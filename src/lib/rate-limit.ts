import { COLLECTIONS, getDb } from "@/lib/firestore";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type AttemptDoc = {
  count: number;
  windowStart: number;
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

/** Firestore-backed sliding-window rate limit: `maxAttempts` per `windowMs` per key. */
export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const ref = getDb().collection(COLLECTIONS.loginAttempts).doc(key);
  const snapshot = await ref.get();
  const data = snapshot.data() as AttemptDoc | undefined;
  const now = Date.now();

  if (!data || now - data.windowStart > WINDOW_MS) {
    return { allowed: true };
  }

  if (data.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((data.windowStart + WINDOW_MS - now) / 1000));
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export async function recordFailedAttempt(key: string): Promise<void> {
  const db = getDb();
  const ref = db.collection(COLLECTIONS.loginAttempts).doc(key);
  const now = Date.now();

  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const data = snapshot.data() as AttemptDoc | undefined;

    if (!data || now - data.windowStart > WINDOW_MS) {
      tx.set(ref, { count: 1, windowStart: now });
    } else {
      tx.set(ref, { count: data.count + 1, windowStart: data.windowStart });
    }
  });
}

export async function clearAttempts(key: string): Promise<void> {
  await getDb().collection(COLLECTIONS.loginAttempts).doc(key).delete();
}
