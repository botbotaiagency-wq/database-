import { useState, useEffect } from 'react'
import { Phone, DollarSign } from 'lucide-react'

const PIPELINE_STAGES = [
  { key: 'lead', label: 'New Leads', color: '#8888cc' },
  { key: 'prospecting', label: 'Prospecting', color: '#6e8efb' },
  { key: 'follow_up', label: 'Follow Up', color: '#ffd700' },
  { key: 'opportunity', label: 'Opportunity', color: '#00ffcc' },
  { key: 'demo', label: 'Demo', color: '#00d4ff' },
  { key: 'closing', label: 'Closing', color: '#c055ff' },
  { key: 'won', label: 'Won', color: '#00ff88' },
]

export default function Pipeline() {
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(setContacts)
  }, [])

  const updatePipeline = async (contactId, newPipeline) => {
    await fetch(`/api/contacts/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pipeline: newPipeline })
    })
    fetch('/api/contacts').then(r => r.json()).then(setContacts)
  }

  const totalPipelineRevenue = contacts
    .filter(c => ['closing', 'demo', 'follow_up', 'opportunity'].includes(c.pipeline))
    .reduce((sum, c) => sum + c.revenue, 0)

  return (
    <div>
      <div className="page-header">
        <h2>Sales Pipeline</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Pipeline Value:
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 18,
            fontWeight: 700,
            color: '#00ff88',
            textShadow: '0 0 20px rgba(0,255,136,0.4)'
          }}>
            RM {totalPipelineRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="pipeline-board">
        {PIPELINE_STAGES.map(stage => {
          const stageContacts = contacts.filter(c => c.pipeline === stage.key)
          const stageRevenue = stageContacts.reduce((sum, c) => sum + c.revenue, 0)

          return (
            <div key={stage.key} className="pipeline-column">
              <div className="pipeline-column-header">
                <div>
                  <h4 style={{ color: stage.color, textShadow: `0 0 12px ${stage.color}40` }}>{stage.label}</h4>
                  {stageRevenue > 0 && (
                    <span style={{
                      fontSize: 12,
                      fontFamily: 'JetBrains Mono',
                      color: '#00ff88',
                      opacity: 0.8
                    }}>
                      RM {stageRevenue.toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="pipeline-count">{stageContacts.length}</span>
              </div>

              <div
                className="pipeline-cards"
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  const contactId = parseInt(e.dataTransfer.getData('contactId'))
                  if (contactId) updatePipeline(contactId, stage.key)
                }}
              >
                {stageContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="pipeline-card"
                    draggable
                    onDragStart={e => e.dataTransfer.setData('contactId', contact.id.toString())}
                  >
                    <div className="pipeline-card-name">{contact.name}</div>
                    <div className="pipeline-card-business">{contact.business}</div>
                    {contact.phone && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        <Phone size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {contact.phone}
                      </div>
                    )}
                    <div className="pipeline-card-footer">
                      {contact.revenue > 0 ? (
                        <div className="pipeline-card-revenue">
                          <DollarSign size={12} style={{ verticalAlign: 'middle' }} />
                          RM {contact.revenue.toLocaleString()}
                        </div>
                      ) : <div />}
                      {contact.system && (
                        <span style={{
                          fontSize: 10,
                          background: 'rgba(192,85,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: 10,
                          color: 'var(--text-muted)'
                        }}>
                          {contact.system.length > 20 ? contact.system.slice(0, 20) + '...' : contact.system}
                        </span>
                      )}
                    </div>
                    {contact.status && (
                      <div className="pipeline-card-status" title={contact.status}>
                        {contact.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
