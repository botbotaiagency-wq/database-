import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'

const SUGGESTIONS = [
  'Who needs follow up?',
  'Total pipeline value?',
  'Show closing deals',
  'Dead leads summary',
  'Top revenue contacts',
  'Pipeline health',
]

function processQuery(query, contacts) {
  const q = query.toLowerCase().trim()

  const closing = contacts.filter(c => c.pipeline === 'closing')
  const demo = contacts.filter(c => c.pipeline === 'demo')
  const followUp = contacts.filter(c => c.pipeline === 'follow_up')
  const dead = contacts.filter(c => c.pipeline === 'dead')
  const won = contacts.filter(c => c.pipeline === 'won')
  const active = contacts.filter(c => ['closing', 'demo', 'follow_up', 'opportunity'].includes(c.pipeline))
  const totalPipeline = active.reduce((s, c) => s + c.revenue, 0)
  const wonRevenue = won.reduce((s, c) => s + c.revenue, 0)

  // Search by name
  const nameMatch = contacts.filter(c => c.name.toLowerCase().includes(q))
  if (nameMatch.length > 0 && nameMatch.length <= 5 && q.length > 2) {
    return nameMatch.map(c =>
      `${c.name} - ${c.business || 'No business'} | Stage: ${c.pipeline} | Revenue: RM ${c.revenue.toLocaleString()} | Status: ${c.status || 'None'}`
    ).join('\n')
  }

  if (q.includes('follow up') || q.includes('follow-up') || q.includes('needs attention')) {
    if (followUp.length === 0) return 'No contacts in Follow Up stage right now.'
    return `${followUp.length} contacts need follow up:\n` +
      followUp.map(c => `- ${c.name} (${c.business}) ${c.revenue > 0 ? `RM ${c.revenue.toLocaleString()}` : ''} ${c.status ? `| ${c.status}` : ''}`).join('\n')
  }

  if (q.includes('pipeline value') || q.includes('total pipeline') || q.includes('total revenue')) {
    return `Active pipeline value: RM ${totalPipeline.toLocaleString()}\nWon revenue: RM ${wonRevenue.toLocaleString()}\nTotal across all: RM ${(totalPipeline + wonRevenue).toLocaleString()}\n\nBreakdown:\n- Closing (${closing.length}): RM ${closing.reduce((s,c) => s+c.revenue, 0).toLocaleString()}\n- Demo (${demo.length}): RM ${demo.reduce((s,c) => s+c.revenue, 0).toLocaleString()}\n- Follow Up (${followUp.length}): RM ${followUp.reduce((s,c) => s+c.revenue, 0).toLocaleString()}`
  }

  if (q.includes('closing')) {
    if (closing.length === 0) return 'No deals in Closing stage.'
    return `${closing.length} closing deals (RM ${closing.reduce((s,c) => s+c.revenue, 0).toLocaleString()}):\n` +
      closing.map(c => `- ${c.name}: RM ${c.revenue.toLocaleString()} | ${c.status || 'No status'}`).join('\n')
  }

  if (q.includes('demo')) {
    if (demo.length === 0) return 'No deals in Demo stage.'
    return `${demo.length} demo deals (RM ${demo.reduce((s,c) => s+c.revenue, 0).toLocaleString()}):\n` +
      demo.map(c => `- ${c.name}: RM ${c.revenue.toLocaleString()} | ${c.status || 'No status'}`).join('\n')
  }

  if (q.includes('dead') || q.includes('lost')) {
    return `${dead.length} dead leads (${((dead.length / contacts.length) * 100).toFixed(0)}% attrition):\n` +
      dead.slice(0, 8).map(c => `- ${c.name} (${c.business || '?'}) ${c.remarks ? `| ${c.remarks}` : ''}`).join('\n') +
      (dead.length > 8 ? `\n...and ${dead.length - 8} more` : '')
  }

  if (q.includes('top revenue') || q.includes('highest revenue') || q.includes('best deals')) {
    const sorted = [...contacts].filter(c => c.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 8)
    if (sorted.length === 0) return 'No contacts with revenue yet.'
    return `Top revenue contacts:\n` +
      sorted.map((c, i) => `${i + 1}. ${c.name} - RM ${c.revenue.toLocaleString()} (${c.pipeline})`).join('\n')
  }

  if (q.includes('pipeline health') || q.includes('overview') || q.includes('summary') || q.includes('how') && q.includes('doing')) {
    const stages = {}
    contacts.forEach(c => { stages[c.pipeline] = (stages[c.pipeline] || 0) + 1 })
    const stageList = Object.entries(stages).sort((a, b) => b[1] - a[1])
    return `Pipeline Overview (${contacts.length} total contacts):\n` +
      stageList.map(([k, v]) => `- ${k}: ${v} contacts`).join('\n') +
      `\n\nActive pipeline: RM ${totalPipeline.toLocaleString()}\nWon: RM ${wonRevenue.toLocaleString()}\n\n` +
      (closing.length > 0 ? `Action: ${closing.length} deals ready to close worth RM ${closing.reduce((s,c) => s+c.revenue, 0).toLocaleString()}` : 'No deals in closing stage.')
  }

  if (q.includes('ghost') || q.includes('mia') || q.includes('unresponsive')) {
    const ghosts = contacts.filter(c => c.system?.toLowerCase().includes('ghost') || c.status?.toLowerCase().includes('m.i.a') || c.status?.toLowerCase().includes('mia'))
    return `${ghosts.length} unresponsive/ghost contacts:\n` +
      ghosts.slice(0, 8).map(c => `- ${c.name} (${c.business || '?'})`).join('\n') +
      (ghosts.length > 8 ? `\n...and ${ghosts.length - 8} more` : '')
  }

  if (q.includes('won') || q.includes('closed')) {
    if (won.length === 0) return 'No won deals yet.'
    return `${won.length} won deals (RM ${wonRevenue.toLocaleString()}):\n` +
      won.map(c => `- ${c.name}: RM ${c.revenue.toLocaleString()} | ${c.business || ''}`).join('\n')
  }

  if (q.includes('opportunity') || q.includes('opportunities')) {
    const opps = contacts.filter(c => c.pipeline === 'opportunity')
    if (opps.length === 0) return 'No opportunities in pipeline.'
    return `${opps.length} opportunities:\n` +
      opps.map(c => `- ${c.name} (${c.business || '?'}) ${c.revenue > 0 ? `RM ${c.revenue.toLocaleString()}` : ''} | ${c.status || ''}`).join('\n')
  }

  if (q.includes('help') || q.includes('what can you')) {
    return `I can help you with:\n- Pipeline queries (closing, demo, follow up, won, dead)\n- Revenue summaries (total pipeline, top revenue)\n- Contact search (type any name)\n- Health reports (pipeline health, overview)\n- Ghost/MIA contacts\n\nTry asking: "Who needs follow up?" or "Show closing deals"`
  }

  // Fallback: try searching by any word
  const words = q.split(/\s+/).filter(w => w.length > 2)
  for (const word of words) {
    const found = contacts.filter(c =>
      c.name.toLowerCase().includes(word) ||
      c.business.toLowerCase().includes(word) ||
      c.system.toLowerCase().includes(word)
    )
    if (found.length > 0 && found.length <= 10) {
      return `Found ${found.length} match${found.length > 1 ? 'es' : ''} for "${word}":\n` +
        found.map(c => `- ${c.name} (${c.business || '?'}) | ${c.pipeline} ${c.revenue > 0 ? `| RM ${c.revenue.toLocaleString()}` : ''}`).join('\n')
    }
  }

  return `I'm not sure what you're asking. Try:\n- "Who needs follow up?"\n- "Total pipeline value?"\n- "Show closing deals"\n- "Pipeline health"\n- Or type a contact name to search`
}

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey! I\'m your CRM assistant. Ask me about your pipeline, deals, or contacts.' }
  ])
  const [input, setInput] = useState('')
  const [contacts, setContacts] = useState([])
  const messagesEnd = useRef(null)

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(setContacts)
  }, [])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text) => {
    const msg = text || input
    if (!msg.trim()) return

    const userMsg = { role: 'user', text: msg.trim() }
    const response = processQuery(msg, contacts)
    const botMsg = { role: 'bot', text: response }

    setMessages(prev => [...prev, userMsg, botMsg])
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  if (!open) {
    return (
      <button className="chatbot-fab" onClick={() => setOpen(true)} title="CRM Assistant">
        <MessageSquare size={20} />
      </button>
    )
  }

  return (
    <>
      <button className="chatbot-fab" onClick={() => setOpen(false)}>
        <X size={20} />
      </button>
      <div className="chatbot-panel">
        <div className="chatbot-header">
          <h4>CRM Assistant</h4>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
            <X size={14} />
          </button>
        </div>
        <div className="chatbot-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role}`}>
              {m.text.split('\n').map((line, j) => (
                <div key={j}>{line}</div>
              ))}
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>
        <div className="chat-suggestions">
          {SUGGESTIONS.slice(0, 4).map((s, i) => (
            <button key={i} className="chat-suggestion-btn" onClick={() => handleSend(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="chatbot-input-area">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your CRM..."
          />
          <button onClick={() => handleSend()}>
            <Send size={14} />
          </button>
        </div>
      </div>
    </>
  )
}
