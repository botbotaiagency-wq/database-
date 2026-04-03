import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'server', 'data.json');
const CONTACTS_KEY = 'contacts';

let redis = null;
let redisOk = true;

function getRedis() {
  if (!redisOk) return null;
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    redis = new Redis({ url, token });
  }
  return redis;
}

function loadFromFile() {
  try {
    return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
  } catch (e) {
    console.error('File read failed:', e.message);
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
      console.error('Redis load failed:', e.message);
      redisOk = false;
      return loadFromFile();
    }
  }

  return loadFromFile();
}

export async function saveData(data) {
  const db = getRedis();
  if (db) {
    try {
      await db.set(CONTACTS_KEY, data);
    } catch (e) {
      console.error('Redis save failed:', e.message);
      redisOk = false;
    }
  }
}
