import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

interface InlineAddLeadProps {
  onAdd: (name: string) => void
  onCancel: () => void
}

export function InlineAddLead({ onAdd, onCancel }: InlineAddLeadProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onAdd(value.trim())
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="rounded-xl border border-[#FF6500]/50 bg-[#112236] p-3 ring-1 ring-[#FF6500]/20">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (!value.trim()) onCancel() }}
        placeholder="Nome do lead..."
        className="w-full bg-transparent text-sm text-white placeholder-[#1E3E62] outline-none"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[#1E3E62]">Enter para criar · Esc para cancelar</span>
        <button
          onClick={onCancel}
          className="text-[#1E3E62] hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
