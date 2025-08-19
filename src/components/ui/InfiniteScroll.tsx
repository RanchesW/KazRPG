// ===== src/components/ui/InfiniteScroll.tsx =====
'use client'

import { useCallback, useEffect, useRef } from 'react'

interface InfiniteScrollProps {
  children: React.ReactNode
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  loader?: React.ReactNode
  threshold?: number
}

export function InfiniteScroll({
  children,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  loader,
  threshold = 100,
}: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `${threshold}px`,
    })

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [handleIntersect, threshold])

  return (
    <>
      {children}
      
      {hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {isFetchingNextPage ? (
            loader || <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          ) : null}
        </div>
      )}
    </>
  )
}