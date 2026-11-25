'use client'
import { useState } from 'react'

interface Props {
  minPrice?: string
  maxPrice?: string
  onApply: (min: string, max: string) => void
}

export default function PriceFilter({ minPrice, maxPrice, onApply }: Props) {
  const [min, setMin] = useState(minPrice || '12000')
  const [max, setMax] = useState(maxPrice || '150000')

  return (
    <div className="border-b border-gray-200 py-3">
      <p className="font-semibold text-sm text-gray-800 mb-3">Price Range</p>
      <div className="flex items-center gap-2 mb-3">
        <input
          type="number"
          value={min}
          onChange={e => setMin(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Min"
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          value={max}
          onChange={e => setMax(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm"
          placeholder="Max"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>৳{min}</span>
        <span>৳{max}</span>
      </div>
      <button
        onClick={() => onApply(min, max)}
        className="w-full bg-orange-500 text-white py-2 rounded text-sm font-medium hover:bg-orange-600 transition cursor-pointer"
      >
        Apply Price Filter
      </button>
    </div>
  )
}