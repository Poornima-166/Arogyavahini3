import { app, ensureInitialized } from '../src/app';

/**
 * Vercel Serverless Function entry point.
 * Wraps Express in a Promise that explicitly waits for response finish/close events,
 * preventing Vercel from terminating the serverless execution early (which causes FUNCTION_INVOCATION_FAILED).
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Ensure migrations and initial DB connections are initialized with timeout
    await Promise.race([
      ensureInitialized(),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (err: any) {
    console.warn('[Vercel Serverless DB Init Warning]', err?.message);
  }

  // 2. Await response completion to prevent Vercel FUNCTION_INVOCATION_FAILED
  return new Promise<void>((resolve, reject) => {
    let resolved = false;

    const onComplete = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    res.once('finish', onComplete);
    res.once('close', onComplete);
    res.once('error', (err: any) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    try {
      app(req, res, (err: any) => {
        if (err && !resolved) {
          resolved = true;
          reject(err);
        } else {
          onComplete();
        }
      });
    } catch (syncErr) {
      if (!resolved) {
        resolved = true;
        reject(syncErr);
      }
    }
  });
}
