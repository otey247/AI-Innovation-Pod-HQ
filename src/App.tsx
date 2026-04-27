import { useState, type ReactNode } from 'react'
import { LayoutGrid, BarChart3, Users } from 'lucide-react'
import PodConfigurator from './components/PodConfigurator'
import SkillsHeatmap from './components/SkillsHeatmap'
import ConsultantMarketplace from './components/ConsultantMarketplace'

type Tab = 'configurator' | 'heatmap' | 'marketplace'

const TABS: { id: Tab; label: string; icon: ReactNode; desc: string }[] = [
  {
    id: 'configurator',
    label: 'Pod Staffing Configurator',
    icon: <LayoutGrid size={16} />,
    desc: 'Design the right pod for any opportunity',
  },
  {
    id: 'heatmap',
    label: 'Skills Coverage Heatmap',
    icon: <BarChart3 size={16} />,
    desc: 'Visualise skill gaps across pursuits',
  },
  {
    id: 'marketplace',
    label: 'Consultant Marketplace',
    icon: <Users size={16} />,
    desc: 'Match consultants to opportunities',
  },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('configurator')

  return (
    <div style={{ minHeight: '100vh' }}>
      <nav className="nav">
        <span className="nav-logo">🚀 AI Innovation Pod HQ</span>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: '1.5rem 2rem', maxWidth: 1400, margin: '0 auto' }}>
        {activeTab === 'configurator' && <PodConfigurator />}
        {activeTab === 'heatmap' && <SkillsHeatmap />}
        {activeTab === 'marketplace' && <ConsultantMarketplace />}
      </main>
    </div>
  )
}
