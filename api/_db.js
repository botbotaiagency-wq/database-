import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'server', 'data.json');
const CONTACTS_KEY = 'contacts';

let redis = null;
let redisChecked = false;

async function getRedis() {
  if (redisChecked) return redis;
  redisChecked = true;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      const mod = await import('@upstash/redis');
      const Redis = mod.Redis || mod.default?.Redis;
      if (Redis) {
        redis = new Redis({ url, token });
      }
    } catch (e) {
      console.error('Redis init failed:', e.message);
      redis = null;
    }
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
  const db = await getRedis();

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
      return loadFromFile();
    }
  }

  return loadFromFile();
}

export async function saveData(data) {
  const db = await getRedis();
  if (db) {
    try {
      await db.set(CONTACTS_KEY, data);
    } catch (e) {
      console.error('Redis save failed:', e.message);
    }
  }
}
