import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useNotifications } from './useNotifications'
import type { NotificationType } from '@/types/database'

const TYPE_META: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  automation: { icon: <Sparkles size={13} />,      color: '#FF6500' },
  success:    { icon: <CheckCircle2 size={13} />,  color: '#22C55E' },
  warning:    { icon: <AlertTriangle size={13} />, color: '#b3261e' },
  info:       { icon: <Info size={13} />,          color: '#60A5FA' },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleToggle() {
    const next = !open
    setOpen(next)
    if (next && unreadCount > 0) markAllRead()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl text-[#A1B5CC] hover:text-white transition-all duration-150 cursor-pointer"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        aria-label="Notificações"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#FF6500', boxShadow: '0 0 6px rgba(255,101,0,0.6)' }}
          />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 mt-2 w-[360px] max-h-[440px] flex flex-col rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(8, 12, 20, 0.96)',
              backdropFilter: 'blur(24px) saturate(160%)',
              WebkitBackdropFilter: 'blur(24px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <span className="text-[13px] font-semibold text-white">Notificações</span>
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                Automações Kotz
              </span>
            </div>

            {/* List */}
            <div className="overflow-y-auto overscroll-contain flex-1">
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <Bell size={18} className="mx-auto mb-2 text-white/15" />
                  <p className="text-[13px] text-white/30">Nenhuma notificação ainda.</p>
                </div>
              ) : (
                notifications.map(n => {
                  const meta = TYPE_META[n.type] ?? TYPE_META.info
                  return (
                    <div
                      key={n.id}
                      className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-b-0 transition-colors duration-150 hover:bg-white/[0.02]"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${meta.color}12`, color: meta.color }}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white leading-snug">{n.title}</p>
                        {n.message && (
                          <p className="text-[12px] text-[#A1B5CC] mt-0.5 leading-relaxed">{n.message}</p>
                        )}
                        <span className="text-[10px] font-mono text-white/25 mt-1 block">
                          {timeAgo(n.created_at)} atrás
                        </span>
                      </div>
                      {!n.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6500] shrink-0 mt-2" />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
