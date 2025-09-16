'use client'

import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface DateFilterProps {
  value: string
  onValueChange: (value: string) => void
  intervalStart?: string
  intervalEnd?: string
  onIntervalChange?: (start: string, end: string) => void
  label?: string
  className?: string
}

export function DateFilter({ 
  value, 
  onValueChange, 
  intervalStart,
  intervalEnd,
  onIntervalChange,
  label = "Период:",
  className = "w-32"
}: DateFilterProps) {
  const [showInterval, setShowInterval] = useState(false)
  const [tempStart, setTempStart] = useState(intervalStart || '')
  const [tempEnd, setTempEnd] = useState(intervalEnd || '')

  const handleValueChange = (newValue: string) => {
    if (newValue === 'interval') {
      setShowInterval(true)
    } else {
      setShowInterval(false)
      onValueChange(newValue)
    }
  }

  const handleIntervalApply = () => {
    if (tempStart && tempEnd && onIntervalChange) {
      onIntervalChange(tempStart, tempEnd)
      onValueChange('interval')
      setShowInterval(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      {label && <Label className="text-sm">{label}</Label>}
      
      <Popover open={showInterval} onOpenChange={setShowInterval}>
        <PopoverTrigger asChild>
          <div>
            <Select value={value} onValueChange={handleValueChange}>
              <SelectTrigger className={className}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">День</SelectItem>
                <SelectItem value="week">Неделя</SelectItem>
                <SelectItem value="month">Месяц</SelectItem>
                <SelectItem value="all">Все время</SelectItem>
                <SelectItem value="interval">Интервал...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Выберите интервал</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date" className="text-sm">Начало</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="end-date" className="text-sm">Конец</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowInterval(false)
                  setTempStart(intervalStart || '')
                  setTempEnd(intervalEnd || '')
                }}
              >
                Отмена
              </Button>
              <Button
                size="sm"
                onClick={handleIntervalApply}
                disabled={!tempStart || !tempEnd}
              >
                Применить
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {value === 'interval' && intervalStart && intervalEnd && (
        <span className="text-xs text-gray-500">
          {new Date(intervalStart).toLocaleDateString()} - {new Date(intervalEnd).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}