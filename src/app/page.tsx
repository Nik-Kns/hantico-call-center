'use client'

import { redirect } from 'next/navigation'

export default function HomePage() {
  // Редирект на страницу компаний
  redirect('/companies')
}


