"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

interface FeaturesInputProps {
  value: Record<string, any>
  onChange: (features: Record<string, any>) => void
  error?: string
}

export function FeaturesInput({ value = {}, onChange, error }: FeaturesInputProps) {
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  const safeValue = value || {}

  const addFeature = () => {
    const key = newKey.trim()
    const val = newValue.trim()
    if (key && val) {
      onChange({ ...safeValue, [key]: val })
      setNewKey("")
      setNewValue("")
    }
  }

  const removeFeature = (key: string) => {
    const updatedFeatures = { ...safeValue }
    delete updatedFeatures[key]
    onChange(updatedFeatures)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addFeature()
    }
  }

  return (
    <div className="space-y-3">
      {Object.entries(safeValue).map(([key, val]) => (
        <div key={key} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
          <span className="font-medium text-sm text-gray-700 min-w-0">{key}:</span>
          <span className="text-sm flex-1 break-all text-gray-900">{String(val)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeFeature(key)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {/* Input for new feature */}
      <div className="flex gap-2">
        <Input
          placeholder="Feature name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 h-10"
        />
        <Input
          placeholder="Feature value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 h-10"
        />
        <Button
          type="button"
          onClick={addFeature}
          size="default"
          disabled={!newKey.trim() || !newValue.trim()}
          className="h-10 px-4"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}
