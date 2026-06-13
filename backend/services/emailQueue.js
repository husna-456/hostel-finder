// backend/services/emailQueue.js
// Sequential email queue with rate limiting.
// Fires one job at a time; waits SEND_DELAY_MS after each delivery before
// starting the next — keeps burst volume low and avoids triggering spam
// filters when multiple events fire close together (e.g. bulk bookings).

const SEND_DELAY_MS = 1500; // 1.5 s between sends
const MAX_QUEUED    = 500;

const queue  = [];
let   active = false;

const processNext = () => {
  if (active || queue.length === 0) return;
  active = true;

  const fn = queue.shift();
  setImmediate(async () => {
    try {
      await fn();
    } catch (err) {
      console.error("[emailQueue] ❌ Job failed:", err.message);
      if (err.stack) console.error("[emailQueue]    Stack:", err.stack);
    } finally {
      active = false;
      if (queue.length > 0) {
        setTimeout(processNext, SEND_DELAY_MS);
      }
    }
  });
};

export const enqueue = (fn) => {
  if (queue.length >= MAX_QUEUED) {
    console.warn(`[emailQueue] Saturated — dropping job (${queue.length} queued)`);
    return;
  }
  queue.push(fn);
  processNext();
};

export const queueDepth = () => queue.length;
