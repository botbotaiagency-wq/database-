import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Contacts from './components/Contacts'
import Pipeline from './components/Pipeline'
import Chatbot from './components/Chatbot'

export default function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/pipeline" element={<Pipeline />} />
        </Routes>
      </main>
      <Chatbot />
    </div>
  )
}
