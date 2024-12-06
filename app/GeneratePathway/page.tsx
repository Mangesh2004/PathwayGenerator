'use client'

import PathwayComponent from '@/components/Pathway'
import { useUser } from '@clerk/nextjs'
import React from 'react'

export default function page({ userId }: { userId: string }) {
    const {user}=useUser()
  return (
    <div>
      <PathwayComponent userId={user?.id ||''} />
    </div>
  )
}
