'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function FilterAccordion({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left font-semibold text-sm text-gray-800"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}