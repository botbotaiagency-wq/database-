import { useState, useEffect } from 'react'
import { Search, Plus, Edit3, Trash2, Phone, Building2, X } from 'lucide-react'

const PIPELINE_OPTIONS = [
  { value: 'lead', label: 'New Lead' },
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'demo', label: 'Demo' },
  { value: 'closing', label: 'Closing' },
  { value: 'won', label: 'Won' },
  { value: 'opportunity', label: 'Opportunity' },
  { value: 'future', label: 'Future' },
  { value: 'filtered', label: 'Filtered' },
  { value: 'dead', label: 'Dead' },
]

const PIPELINE_LABELS = Object.fromEntries(PIPELINE_OPTIONS.map(p => [p.value, p.label]))

const emptyForm = { name: '', phone: '', business: '', system: '', status: '', remarks: '', revenue: 0, pipeline: 'lead' }

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadContacts = () => {
    fetch('/api/contacts').then(r => r.json()).then(setContacts)
  }

  useEffect(() => { loadContacts() }, [])

  const filtered = contacts.filter(c => {
    const matchesSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.business.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchesFilter = filter === 'all' || c.pipeline === filter
    return matchesSearch && matchesFilter
  })

  const openNew = () => {
    setEditingContact(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (contact) => {
    setEditingContact(contact)
    setForm({ ...contact })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingContact) {
      await fetch(`/api/contacts/${editingContact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    } else {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
    }
    setShowModal(false)
    loadContacts()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    loadContacts()
  }

  const pipelineCounts = contacts.reduce((acc, c) => {
    acc[c.pipeline] = (acc[c.pipeline] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <h2>Contacts ({filtered.length})</h2>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Add Contact
        </button>
      </div>

      <div className="search-bar">
        <Search />
        <input
          type="text"
          placeholder="Search by name, business, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-bar">
        <button
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({contacts.length})
        </button>
        {PIPELINE_OPTIONS.map(p => {
          const count = pipelineCounts[p.value] || 0
          if (count === 0) return null
          return (
            <button
              key={p.value}
              className={`filter-chip ${filter === p.value ? 'active' : ''}`}
              onClick={() => setFilter(p.value)}
            >
              {p.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Business</th>
              <th>System</th>
              <th>Stage</th>
              <th>Status</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>
                  {c.phone && (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      <Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {c.phone}
                    </span>
                  )}
                </td>
                <td>
                  {c.business && (
                    <span>
                      <Building2 size={12} style={{ verticalAlign: 'middle', marginRight: 4, color: 'var(--text-muted)' }} />
                      {c.business}
                    </span>
                  )}
                </td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{c.system}</td>
                <td><span className={`badge badge-${c.pipeline}`}>{PIPELINE_LABELS[c.pipeline] || c.pipeline}</span></td>
                <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 200 }}>{c.status}</td>
                <td>
                  {c.revenue > 0 && (
                    <span style={{ color: 'var(--neon-green)', fontFamily: 'JetBrains Mono', fontWeight: 600, textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>
                      RM {c.revenue.toLocaleString()}
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)} title="Edit">
                      <Edit3 size={13} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Business</label>
                <input value={form.business} onChange={e => setForm({...form, business: e.target.value})} />
              </div>
              <div className="form-group">
                <label>System / Service</label>
                <input value={form.system} onChange={e => setForm({...form, system: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Pipeline Stage</label>
                <select value={form.pipeline} onChange={e => setForm({...form, pipeline: e.target.value})}>
                  {PIPELINE_OPTIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <input value={form.status} onChange={e => setForm({...form, status: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Revenue (RM)</label>
                <input type="number" value={form.revenue} onChange={e => setForm({...form, revenue: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Remarks</label>
                <textarea rows={3} value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingContact ? 'Save Changes' : 'Add Contact'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
