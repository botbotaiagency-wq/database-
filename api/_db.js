import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'server', 'data.json');
const CONTACTS_KEY = 'contacts';

// Hardcoded Upstash Redis config as fallback since Vercel Storage
// integration env vars point to a broken host
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || 'https://tight-gorilla-91433.upstash.io';
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || 'gQAAAAAAAWUpAAIncDE5ZWRmMzFiNjlhOWY0YmU0YjY3ZDZjNGUzMWU3ODI1NXAxOTE0MzM';

function getRedis() {
  if (REDIS_URL && REDIS_TOKEN) {
    return new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  }
  return null;
}

function loadFromFile() {
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  } catch (e) {
    return [];
  }
}

export async function loadData() {
  const db = getRedis();
  if (db) {
    try {
      let data = await db.get(CONTACTS_KEY);
      if (!data) {
        data = loadFromFile();
        if (data.length > 0) {
          await db.set(CONTACTS_KEY, data);
        }
      }
      return data;
    } catch (e) {
      console.error('Redis load error:', e.message);
      return loadFromFile();
    }
  }
  return loadFromFile();
}

export async function saveData(data) {
  const db = getRedis();
  if (db) {
    await db.set(CONTACTS_KEY, data);
  }
}
