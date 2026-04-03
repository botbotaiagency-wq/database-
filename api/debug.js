export default async function handler(req, res) {
  res.status(200).json({
    hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasKvToken: !!process.env.KV_REST_API_TOKEN,
    upstashUrlPrefix: (process.env.UPSTASH_REDIS_REST_URL || '').substring(0, 20),
    kvUrlPrefix: (process.env.KV_REST_API_URL || '').substring(0, 20),
  });
}
