// backend/services/emailQueue.js
// Lightweight async job queue — non-blocking, no external dependencies.
// setImmediate defers execution past the current I/O cycle so API responses
// are never held up by email delivery.
//
// ── Upgrading to Bull + Redis (production scale) ───────────────────────────
// 1. npm install bull
// 2. Set REDIS_URL in .env
// 3. Replace enqueue() with:
//
//   import Bull from "bull";
//   const q = new Bull("hostel-finder:emails", process.env.REDIS_URL);
//   q.process(4, async (job) => job.data.fn());
//   q.on("failed", (job, err) => console.error("[emailQueue] failed:", err.message, err.stack));
//   export const enqueue = (fn) => q.add({ fn }, { attempts: 3, backoff: 5000 });
// ──────────────────────────────────────────────────────────────────────────

let pending = 0;
const MAX_PENDING = 500;

export const enqueue = (fn) => {
  if (pending >= MAX_PENDING) {
    console.warn("[emailQueue] Queue saturated — dropping job (pending:", pending, ")");
    return;
  }
  pending++;
  setImmediate(async () => {
    try {
      await fn();
    } catch (err) {
      // Log the full error — message alone hides the root cause
      console.error("[emailQueue] ❌ Job failed:", err.message);
      if (err.stack) console.error("[emailQueue]    Stack:", err.stack);
    } finally {
      pending--;
    }
  });
};
