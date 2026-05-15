// src/components/ReadingProgress.js
'use client'
import { useReadingProgress } from '@/lib/hooks'
import { nicheConfig } from '@/config/site.config'

export default function ReadingProgress() {
  const progress = useReadingProgress()
  const { site } = nicheConfig

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 transition-all duration-150 ease-out"
      style={{
        width: `${progress}%`,
        backgroundColor: site.themeColor,
        boxShadow: `0 0 8px ${site.themeColor}80`,
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  )
}
