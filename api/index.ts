import type { Express } from 'express';
import { createApp } from '../server/index';

let appPromise: Promise<Express> | null = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createApp();
  }
  
  const app = await appPromise;
  return app(req, res);
}

