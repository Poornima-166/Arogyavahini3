import { app, ensureInitialized } from '../src/app';

export default async function handler(req: any, res: any) {
  await ensureInitialized();
  return app(req, res);
}
