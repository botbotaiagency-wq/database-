import { loadData } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const data = await loadData();
    const totalContacts = data.length;
    const totalRevenue = data.reduce((sum, c) => sum + c.revenue, 0);
    const activeDeals = data.filter(c => ['closing', 'demo', 'follow_up', 'opportunity'].includes(c.pipeline)).length;
    const wonDeals = data.filter(c => c.pipeline === 'won').length;
    const deadDeals = data.filter(c => c.pipeline === 'dead').length;

    const pipelineCounts = {};
    data.forEach(c => {
      pipelineCounts[c.pipeline] = (pipelineCounts[c.pipeline] || 0) + 1;
    });

    const revenueByPipeline = {};
    data.forEach(c => {
      if (c.revenue > 0) {
        revenueByPipeline[c.pipeline] = (revenueByPipeline[c.pipeline] || 0) + c.revenue;
      }
    });

    const businessTypes = {};
    data.forEach(c => {
      if (c.business) {
        businessTypes[c.business] = (businessTypes[c.business] || 0) + 1;
      }
    });

    return res.status(200).json({
      totalContacts,
      totalRevenue,
      activeDeals,
      wonDeals,
      deadDeals,
      pipelineCounts,
      revenueByPipeline,
      businessTypes
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
