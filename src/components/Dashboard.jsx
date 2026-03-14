import { useState, useEffect } from 'react'
import { Users, DollarSign, TrendingUp, XCircle, Zap, Clock, Activity } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar,
} from 'recharts'

const PIPELINE_LABELS = {
  won: 'Won',
  closing: 'Closing',
  demo: 'Demo',
  follow_up: 'Follow Up',
  opportunity: 'Opportunity',
  prospecting: 'Prospecting',
  lead: 'New Lead',
  future: 'Future',
  dead: 'Dead',
  filtered: 'Filtered'
}

const PIPELINE_COLORS = {
  won: '#00ff88',
  closing: '#b44aff',
  demo: '#00d4ff',
  follow_up: '#ffd700',
  opportunity: '#00ffcc',
  prospecting: '#6e8efb',
  lead: '#8888cc',
  future: '#e040fb',
  dead: '#ff3366',
  filtered: '#556677'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(5, 5, 12, 0.95)',
        border: '1px solid rgba(0, 136, 255, 0.3)',
        borderRadius: 3,
        padding: '10px 14px',
        fontSize: 12,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        <p style={{ color: '#e0e0f8', fontWeight: 600, marginBottom: 3 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#0088ff', fontSize: 11 }}>
            {p.name}: {typeof p.value === 'number' && p.value > 100 ? `RM ${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/contacts').then(r => r.json()).then(setContacts)
  }, [])

  if (!stats) return (
    <div style={{ color: 'var(--text-muted)', padding: 40, textAlign: 'center' }}>
      <div className="loading-pulse">Loading dashboard...</div>
    </div>
  )

  const revenueData = Object.entries(stats.revenueByPipeline)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      name: PIPELINE_LABELS[key] || key,
      revenue: value,
      fill: PIPELINE_COLORS[key] || '#0088ff'
    }))

  const pipelineData = Object.entries(stats.pipelineCounts)
    .filter(([key]) => !['dead', 'filtered'].includes(key))
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      name: PIPELINE_LABELS[key] || key,
      value,
      fill: PIPELINE_COLORS[key] || '#0088ff'
    }))

  const activeContacts = contacts.filter(c => ['closing', 'demo', 'follow_up', 'opportunity'].includes(c.pipeline))
  const pendingRevenue = activeContacts.reduce((sum, c) => sum + c.revenue, 0)
  const wonRevenue = contacts.filter(c => c.pipeline === 'won').reduce((sum, c) => sum + c.revenue, 0)

  const bizEntries = Object.entries(stats.businessTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      subject: name.length > 14 ? name.slice(0, 14) + '...' : name,
      count: value,
      fullMark: Math.max(...Object.values(stats.businessTypes))
    }))

  const hotDeals = contacts
    .filter(c => c.revenue > 0 && ['closing', 'demo'].includes(c.pipeline))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <div className="dashboard-wrap">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h2 className="dash-title">Dashboard</h2>
          <span className="dash-subtitle">
            <Activity size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {stats.activeDeals} active deals in pipeline
          </span>
        </div>
        <span className="dash-date">
          <Clock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi-card neon-purple">
          <div className="kpi-label">
            <Users size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Contacts
          </div>
          <div className="kpi-value purple">{stats.totalContacts}</div>
          <div className="kpi-sub">{stats.activeDeals} active</div>
        </div>
        <div className="kpi-card neon-green">
          <div className="kpi-label">
            <DollarSign size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Won
          </div>
          <div className="kpi-value green">RM {wonRevenue.toLocaleString()}</div>
          <div className="kpi-sub">{stats.wonDeals} closed</div>
        </div>
        <div className="kpi-card neon-cyan">
          <div className="kpi-label">
            <TrendingUp size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Pipeline
          </div>
          <div className="kpi-value cyan">RM {pendingRevenue.toLocaleString()}</div>
          <div className="kpi-sub">{activeContacts.length} in progress</div>
        </div>
        <div className="kpi-card neon-red">
          <div className="kpi-label">
            <XCircle size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Dead
          </div>
          <div className="kpi-value red">{stats.deadDeals}</div>
          <div className="kpi-sub">{((stats.deadDeals / stats.totalContacts) * 100).toFixed(0)}% lost</div>
        </div>
      </div>

      {/* Main chart row - revenue full width or 60/40 split */}
      <div className="dash-row-main">
        <div className="chart-card chart-card-lg">
          <h3>
            <Zap size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#0088ff' }} />
            Revenue by Stage
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0088ff" stopOpacity={0.6} />
                  <stop offset="40%" stopColor="#0088ff" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0088ff" stopOpacity={0.01} />
                </linearGradient>
                <filter id="lineGlow">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: '#5858a0', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(0,136,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#5858a0', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(0,136,255,0.08)' }}
                tickLine={false}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (RM)"
                stroke="#0088ff"
                strokeWidth={2.5}
                fill="url(#revGrad)"
                filter="url(#lineGlow)"
                dot={{ r: 4, fill: '#0088ff', stroke: '#0a0a14', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#4ab8ff', stroke: '#fff', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card chart-card-sm">
          <h3>
            <Zap size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#ff3366' }} />
            Hot Deals
          </h3>
          <div className="activity-list">
            {hotDeals.map(c => (
              <div key={c.id} className="activity-item">
                <div className={`activity-dot ${c.pipeline === 'closing' ? 'purple' : 'cyan'}`} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="activity-text">
                    <span>{c.name}</span>
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#00ff88',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 600,
                    marginTop: 2,
                    textShadow: '0 0 8px rgba(0,255,136,0.3)'
                  }}>
                    RM {c.revenue.toLocaleString()}
                  </div>
                  <div className="activity-time">{c.status}</div>
                </div>
                <span className={`badge badge-${c.pipeline}`} style={{ flexShrink: 0 }}>
                  {PIPELINE_LABELS[c.pipeline]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row - pipeline + business types */}
      <div className="dash-row-bottom">
        <div className="chart-card">
          <h3>
            <Users size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#00ff88' }} />
            Pipeline Distribution
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="18%"
              outerRadius="88%"
              data={pipelineData}
              startAngle={180}
              endAngle={-180}
            >
              <RadialBar
                minAngle={15}
                background={{ fill: 'rgba(255,255,255,0.02)' }}
                clockWise
                dataKey="value"
                cornerRadius={3}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 2 }}>
            {pipelineData.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 5, fontSize: 10,
                color: 'var(--text-secondary)',
                padding: '1px 6px',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 1,
                  background: entry.fill,
                  boxShadow: `0 0 6px ${entry.fill}50`
                }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>
            <TrendingUp size={13} style={{ verticalAlign: 'middle', marginRight: 6, color: '#00d4ff' }} />
            Business Types
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={bizEntries} cx="50%" cy="50%" outerRadius="72%">
              <defs>
                <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(0,136,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#5858a0', fontSize: 9 }}
              />
              <PolarRadiusAxis
                tick={{ fill: '#404068', fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                name="Contacts"
                dataKey="count"
                stroke="#00d4ff"
                strokeWidth={1.5}
                fill="url(#radarFill)"
                dot={{ r: 3, fill: '#00d4ff', stroke: '#0a0a14', strokeWidth: 1.5 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
