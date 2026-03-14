'use client'

import React from 'react'

export const Skeleton = ({ className }) => (
  <div className={`bg-[var(--bg-tertiary)] animate-pulse rounded ${className}`} />
)

export const OpportunitySkeleton = () => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg flex items-start gap-4 p-4 opacity-60">
    <Skeleton className="w-10 h-10 rounded-md shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-16 h-3" />
        <Skeleton className="w-24 h-3" />
      </div>
      <Skeleton className="w-3/4 h-4" />
      <Skeleton className="w-full h-3" />
    </div>
    <div className="shrink-0 flex flex-col items-end gap-2">
      <Skeleton className="w-12 h-4" />
      <div className="flex gap-1">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-6 h-6" />
      </div>
    </div>
  </div>
)

export const StatSkeleton = () => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg p-4 flex items-center justify-between">
    <div className="space-y-2 flex-1">
      <Skeleton className="w-16 h-2" />
      <Skeleton className="w-12 h-6" />
    </div>
    <Skeleton className="w-8 h-8 rounded-md ml-4" />
  </div>
)

export const TableSkeleton = () => (
  <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-lg overflow-hidden">
    <div className="h-12 w-full bg-[var(--bg-tertiary)]" />
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="h-16 w-full border-b border-[var(--border-default)] flex items-center px-4 gap-4">
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-1/6 h-4" />
        <Skeleton className="w-20 h-6 rounded" />
        <Skeleton className="w-1/4 h-4 ml-auto" />
      </div>
    ))}
  </div>
)
