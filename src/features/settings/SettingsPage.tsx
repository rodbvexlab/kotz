import { useState } from 'react'
import { motion } from 'motion/react'
import { User, Building, MessageSquare } from 'lucide-react'
import { ProfileTab } from './components/ProfileTab'
import { WorkspaceTab } from './components/WorkspaceTab'
import { TemplatesTab } from './components/TemplatesTab'

type TabId = 'profile' | 'workspace' | 'templates'

const tabs = [
  { id: 'profile', label: 'Meu Perfil', icon: User },
  { id: 'workspace', label: 'Workspace', icon: Building },
  { id: 'templates', label: 'Templates de Mensagem', icon: MessageSquare },
] as const

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10 text-white min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Configurações</h1>
          <p className="text-sm text-[#A1B5CC]">Gerencie seu perfil, personalize seu workspace e crie templates de mensagem.</p>
        </header>

        {/* Tabs Nav */}
        <div className="flex items-center gap-2 border-b border-[#1E3E62]/30 pb-px">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative
                  ${isActive ? 'text-[#FF6500]' : 'text-[#A1B5CC] hover:text-white'}
                `}
              >
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="settings-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6500]"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="pt-4">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'workspace' && <WorkspaceTab />}
            {activeTab === 'templates' && <TemplatesTab />}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
