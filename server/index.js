import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json());

// Serve built React frontend
const distPath = join(ROOT_DIR, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

const DATA_PATH = join(__dirname, 'data.json');

function loadData() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

function saveData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

// Get all contacts
app.get('/api/contacts', (req, res) => {
  const data = loadData();
  res.json(data);
});

// Get single contact
app.get('/api/contacts/:id', (req, res) => {
  const data = loadData();
  const contact = data.find(c => c.id === parseInt(req.params.id));
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

// Create contact
app.post('/api/contacts', (req, res) => {
  const data = loadData();
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
  saveData(data);
  res.status(201).json(newContact);
});

// Update contact
app.put('/api/contacts/:id', (req, res) => {
  const data = loadData();
  const index = data.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Contact not found' });
  data[index] = { ...data[index], ...req.body, id: data[index].id };
  if (req.body.revenue !== undefined) {
    data[index].revenue = parseFloat(req.body.revenue) || 0;
  }
  saveData(data);
  res.json(data[index]);
});

// Delete contact
app.delete('/api/contacts/:id', (req, res) => {
  let data = loadData();
  const index = data.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Contact not found' });
  data.splice(index, 1);
  saveData(data);
  res.json({ success: true });
});

// Dashboard stats
app.get('/api/stats', (req, res) => {
  const data = loadData();
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

  res.json({
    totalContacts,
    totalRevenue,
    activeDeals,
    wonDeals,
    deadDeals,
    pipelineCounts,
    revenueByPipeline,
    businessTypes
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  const indexPath = join(distPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Run "npm run build" first');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`NexCRM running at http://localhost:${PORT}`);
});
