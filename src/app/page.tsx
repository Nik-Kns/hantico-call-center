'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setIsLoading(false)
  }

  return (
    <div className="flex justify-end">
      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>
    </div>
  )
}


