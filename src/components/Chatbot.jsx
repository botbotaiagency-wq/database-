import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'

const SUGGESTIONS = [
  'Pipeline health check',
  'Who should I call today?',
  'Show closing deals',
  'Stale deals to clean up',
  'Revenue forecast',
  'Top 5 high-value contacts',
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'ICEBRG online. I have full access to your CRM — ask me anything about your pipeline, or tell me to make changes.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    const userMsg = { role: 'user', text: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Build API message history (last 10 messages for context)
    const apiMessages = newMessages
      .slice(-10)
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(err.error || 'API error')
      }

      const data = await res.json()

      let replyText = data.reply || 'No response.'

      // Show executed actions if any
      if (data.actions && data.actions.length > 0) {
        const actionSummary = data.actions.map(a => {
          if (a.action === 'updated') return `Updated: ${a.name}`
          if (a.action === 'created') return `Created: ${a.name}`
          if (a.action === 'deleted') return `Deleted: ${a.name}`
          return ''
        }).filter(Boolean).join('\n')

        if (actionSummary) {
          replyText += '\n\n[CRM UPDATED]\n' + actionSummary
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', text: replyText }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Connection error: ${err.message}. Check if the backend server is running.`
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!open) {
    return (
      <button className="chatbot-fab" onClick={() => setOpen(true)} title="ICEBRG Assistant">
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
          <h4>ICEBRG</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: loading ? '#ffd700' : '#00ff88', textTransform: 'uppercase', letterSpacing: 1 }}>
              {loading ? 'thinking...' : 'online'}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              <X size={14} />
            </button>
          </div>
        </div>
        <div className="chatbot-messages">
          {messages.map((m, i) => (
            <div key={i} className={`chat-msg ${m.role === 'assistant' ? 'bot' : 'user'}`}>
              {m.text.split('\n').map((line, j) => (
                <div key={j}>{line || '\u00A0'}</div>
              ))}
            </div>
          ))}
          {loading && (
            <div className="chat-msg bot" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing CRM data...
            </div>
          )}
          <div ref={messagesEnd} />
        </div>
        {messages.length <= 1 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="chat-suggestion-btn" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="chatbot-input-area">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask ICEBRG anything..."
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={loading}>
            <Send size={14} />
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
