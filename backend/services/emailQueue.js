// backend/services/emailQueue.js
// Lightweight async job queue — non-blocking, no external dependencies.
// Uses setImmediate so email jobs run after the current I/O cycle completes,
// keeping API responses fast while still processing emails reliably.
//
// ── Upgrading to Bull + Redis (production scale) ───────────────────────────
// 1. npm install bull
// 2. Set REDIS_URL in .env
// 3. Replace this file with the Bull implementation below:
//
//   import Bull from "bull";
//   const emailQueue = new Bull("hostel-finder:emails", process.env.REDIS_URL);
//   emailQueue.process(4, async (job) => job.data.fn()); // 4 concurrent workers
//   emailQueue.on("failed", (job, err) =>
//     console.error("[emailQueue] failed:", err.message));
//   export const enqueue = (fn) => emailQueue.add({ fn }, { attempts: 3, backoff: 5000 });
// ──────────────────────────────────────────────────────────────────────────

let pending = 0;
const MAX_PENDING = 500; // safety cap — silent drop when overloaded

export const enqueue = (fn) => {
  if (pending >= MAX_PENDING) {
    console.warn("[emailQueue] queue saturated — dropping job");
    return;
  }
  pending++;
  setImmediate(async () => {
    try {
      await fn();
    } catch (err) {
      console.error("[emailQueue] job error:", err.message);
    } finally {
      pending--;
    }
  });
};
