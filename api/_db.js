import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'server', 'data.json');
const CONTACTS_KEY = 'contacts';

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
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
