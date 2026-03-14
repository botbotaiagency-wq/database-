import { loadData, saveData } from '../_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const contactId = parseInt(id);

  try {
    let data = await loadData();

    if (req.method === 'GET') {
      const contact = data.find(c => c.id === contactId);
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      return res.status(200).json(contact);
    }

    if (req.method === 'PUT') {
      const index = data.findIndex(c => c.id === contactId);
      if (index === -1) return res.status(404).json({ error: 'Contact not found' });
      data[index] = { ...data[index], ...req.body, id: data[index].id };
      if (req.body.revenue !== undefined) {
        data[index].revenue = parseFloat(req.body.revenue) || 0;
      }
      await saveData(data);
      return res.status(200).json(data[index]);
    }

    if (req.method === 'DELETE') {
      const index = data.findIndex(c => c.id === contactId);
      if (index === -1) return res.status(404).json({ error: 'Contact not found' });
      data.splice(index, 1);
      await saveData(data);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
