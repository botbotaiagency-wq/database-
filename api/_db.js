import { Redis } from '@upstash/redis';
import { readFileSync } from 'fs';
import { join } from 'path';

let redis;

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return redis;
}

const CONTACTS_KEY = 'contacts';

export async function loadData() {
  const db = getRedis();
  let data = await db.get(CONTACTS_KEY);

  // If Redis is empty, seed from data.json
  if (!data) {
    const DATA_PATH = join(process.cwd(), 'server', 'data.json');
    data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
    await db.set(CONTACTS_KEY, data);
  }

  return data;
}

export async function saveData(data) {
  const db = getRedis();
  await db.set(CONTACTS_KEY, data);
}
