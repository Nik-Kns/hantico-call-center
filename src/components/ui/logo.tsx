import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
  linkTo?: string
}

export function Logo({ className = '', linkTo = '/companies' }: LogoProps) {
  const LogoContent = () => (
    <div className={`flex items-center ${className}`}>
      <span className="text-3xl font-bold tracking-tight">
        <span className="text-gray-800">Hantic</span>
        <span className="text-red-600">o</span>
      </span>
      <div className="ml-1 relative">
        <div className="absolute top-2 left-0 w-2 h-2 bg-red-600 rounded-full"></div>
        <svg 
          width="14" 
          height="20" 
          viewBox="0 0 14 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-red-600"
        >
          <path 
            d="M7 0 L7 14 L2 20 L7 16 L12 20 L7 14 Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  )

  if (linkTo) {
    return (
      <Link href={linkTo} className="inline-block">
        <LogoContent />
      </Link>
    )
  }

  return <LogoContent />
}

export function LogoWithText({ className = '' }: { className?: string }) {
  return (
    <Link href="/companies" className="inline-block">
      <div className={`flex items-center ${className}`}>
        <div className="w-10 h-10 mr-3 flex-shrink-0">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle 
              cx="50" 
              cy="40" 
              r="25" 
              stroke="#B91C1C" 
              strokeWidth="10" 
              fill="none"
              strokeDasharray="78.5 78.5"
              strokeDashoffset="39.25"
              transform="rotate(-90 50 40)"
            />
            <path 
              d="M50 55 L40 80 L50 70 L60 80 L50 55 Z" 
              fill="#1E293B"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-gray-800">Hantic</span>
              <span className="text-red-600">o</span>
            </span>
          </div>
          <div className="text-xs text-gray-600">
            Сервис платформенной занятости
          </div>
        </div>
      </div>
    </Link>
  )
}
