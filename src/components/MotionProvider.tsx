"use client"
import { MotionConfig } from 'framer-motion'
import React from 'react'

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
  )
}
