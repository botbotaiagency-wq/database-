import { loadData, saveData } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const data = await loadData();

    if (req.method === 'GET') {
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const newContact = {
        id: Math.max(...data.map(c => c.id), 0) + 1,
        name: req.body.name || '',
        phone: req.body.phone || '',
        business: req.body.business || '',
        system: req.body.system || '',
        status: req.body.status || '',
        remarks: req.body.remarks || '',
        revenue: parseFloat(req.body.revenue) || 0,
        pipeline: req.body.pipeline || 'lead'
      };
      data.push(newContact);
      await saveData(data);
      return res.status(201).json(newContact);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
