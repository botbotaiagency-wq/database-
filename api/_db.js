import { readFileSync } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'server', 'data.json');
const CONTACTS_KEY = 'contacts';

let redis = null;
let redisChecked = false;

async function getRedis() {
  if (redisChecked) return redis;
  redisChecked = true;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { Redis } = await import('@upstash/redis');
      redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
    } catch (e) {
      redis = null;
    }
  }
  return redis;
}

function loadFromFile() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

export async function loadData() {
  const db = await getRedis();

  if (db) {
    try {
      let data = await db.get(CONTACTS_KEY);
      if (!data) {
        data = loadFromFile();
        await db.set(CONTACTS_KEY, data);
      }
      return data;
    } catch (e) {
      return loadFromFile();
    }
  }

  return loadFromFile();
}

export async function saveData(data) {
  const db = await getRedis();
  if (db) {
    await db.set(CONTACTS_KEY, data);
  }
}
