import { useState, useEffect } from 'react'
import { Users, DollarSign, TrendingUp, XCircle, Zap, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar, Legend,
  LineChart, Line
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

const NEON_GLOW = {
  purple: { color: '#c055ff', glow: 'rgba(192, 85, 255, 0.6)' },
  green: { color: '#00ff88', glow: 'rgba(0, 255, 136, 0.6)' },
  cyan: { color: '#00d4ff', glow: 'rgba(0, 212, 255, 0.6)' },
  pink: { color: '#ff3366', glow: 'rgba(255, 51, 102, 0.6)' },
  gold: { color: '#ffd700', glow: 'rgba(255, 215, 0, 0.6)' },
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(10, 10, 20, 0.95)',
        border: '1px solid rgba(192, 85, 255, 0.4)',
        borderRadius: 12,
        padding: '12px 16px',
        fontSize: 13,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(192, 85, 255, 0.1)'
      }}>
        <p style={{ color: '#e8e8ff', fontWeight: 600, marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#c055ff', fontSize: 12 }}>
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

  // Revenue by Stage - Area Chart data
  const revenueData = Object.entries(stats.revenueByPipeline)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      name: PIPELINE_LABELS[key] || key,
      revenue: value,
      fill: PIPELINE_COLORS[key] || '#c055ff'
    }))

  // Pipeline distribution - Radial Bar data
  const pipelineData = Object.entries(stats.pipelineCounts)
    .filter(([key]) => !['dead', 'filtered'].includes(key))
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], i) => ({
      name: PIPELINE_LABELS[key] || key,
      value,
      fill: PIPELINE_COLORS[key] || '#c055ff'
    }))

  const activeContacts = contacts.filter(c => ['closing', 'demo', 'follow_up', 'opportunity'].includes(c.pipeline))
  const pendingRevenue = activeContacts.reduce((sum, c) => sum + c.revenue, 0)
  const wonRevenue = contacts.filter(c => c.pipeline === 'won').reduce((sum, c) => sum + c.revenue, 0)

  // Business types for Radar chart
  const bizEntries = Object.entries(stats.businessTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({
      subject: name.length > 14 ? name.slice(0, 14) + '...' : name,
      count: value,
      fullMark: Math.max(...Object.values(stats.businessTypes))
    }))

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard Overview</h2>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          <Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card neon-purple">
          <div className="kpi-icon-bg purple" />
          <div className="kpi-label">
            <Users size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Total Contacts
          </div>
          <div className="kpi-value purple">{stats.totalContacts}</div>
          <div className="kpi-sub">{stats.activeDeals} active deals</div>
        </div>
        <div className="kpi-card neon-green">
          <div className="kpi-icon-bg green" />
          <div className="kpi-label">
            <DollarSign size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Won Revenue
          </div>
          <div className="kpi-value green">RM {wonRevenue.toLocaleString()}</div>
          <div className="kpi-sub">{stats.wonDeals} deals closed</div>
        </div>
        <div className="kpi-card neon-cyan">
          <div className="kpi-icon-bg cyan" />
          <div className="kpi-label">
            <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Pending Revenue
          </div>
          <div className="kpi-value cyan">RM {pendingRevenue.toLocaleString()}</div>
          <div className="kpi-sub">{activeContacts.length} deals in progress</div>
        </div>
        <div className="kpi-card neon-red">
          <div className="kpi-icon-bg red" />
          <div className="kpi-label">
            <XCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Dead Leads
          </div>
          <div className="kpi-value red">{stats.deadDeals}</div>
          <div className="kpi-sub">{((stats.deadDeals / stats.totalContacts) * 100).toFixed(0)}% attrition rate</div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Revenue Area Chart with neon glow */}
        <div className="chart-card">
          <h3>
            <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#c055ff' }} />
            Revenue by Stage
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c055ff" stopOpacity={0.8} />
                  <stop offset="50%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#c055ff" stopOpacity={0.02} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glowStrong">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <XAxis
                dataKey="name"
                tick={{ fill: '#7777aa', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(192,85,255,0.12)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#7777aa', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(192,85,255,0.12)' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (RM)"
                stroke="#c055ff"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                filter="url(#glow)"
                dot={{ r: 5, fill: '#c055ff', stroke: '#e8e8ff', strokeWidth: 2, filter: 'url(#glowStrong)' }}
                activeDot={{ r: 8, fill: '#e040fb', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline Radial Bar Chart */}
        <div className="chart-card">
          <h3>
            <Users size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#00ff88' }} />
            Active Pipeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="20%"
              outerRadius="90%"
              data={pipelineData}
              startAngle={180}
              endAngle={-180}
            >
              <RadialBar
                minAngle={15}
                background={{ fill: 'rgba(255,255,255,0.03)' }}
                clockWise
                dataKey="value"
                cornerRadius={6}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 4 }}>
            {pipelineData.map((entry, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.03)'
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: entry.fill,
                  boxShadow: `0 0 8px ${entry.fill}60`
                }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Business Types Radar Chart */}
        <div className="chart-card">
          <h3>
            <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#00d4ff' }} />
            Business Types (Top 8)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={bizEntries} cx="50%" cy="50%" outerRadius="75%">
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <PolarGrid stroke="rgba(192,85,255,0.15)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#7777aa', fontSize: 10 }}
              />
              <PolarRadiusAxis
                tick={{ fill: '#555577', fontSize: 10 }}
                axisLine={false}
              />
              <Radar
                name="Contacts"
                dataKey="count"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#radarGradient)"
                filter="url(#glow)"
                dot={{ r: 4, fill: '#00d4ff', stroke: '#fff', strokeWidth: 1 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Hot Deals */}
        <div className="chart-card">
          <h3>
            <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 6, color: '#ff3366' }} />
            Hot Deals - Action Required
          </h3>
          <div className="activity-list">
            {contacts
              .filter(c => c.revenue > 0 && ['closing', 'demo'].includes(c.pipeline))
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 6)
              .map(c => (
                <div key={c.id} className="activity-item">
                  <div className={`activity-dot ${c.pipeline === 'closing' ? 'purple' : 'cyan'}`} />
                  <div style={{ flex: 1 }}>
                    <div className="activity-text">
                      <span>{c.name}</span> &mdash; {c.business}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: '#00ff88',
                      fontFamily: 'JetBrains Mono',
                      fontWeight: 600,
                      marginTop: 3,
                      textShadow: '0 0 12px rgba(0,255,136,0.4)'
                    }}>
                      RM {c.revenue.toLocaleString()}
                    </div>
                    <div className="activity-time">{c.status}</div>
                  </div>
                  <span className={`badge badge-${c.pipeline}`} style={{ alignSelf: 'flex-start', marginTop: 2 }}>
                    {PIPELINE_LABELS[c.pipeline]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
