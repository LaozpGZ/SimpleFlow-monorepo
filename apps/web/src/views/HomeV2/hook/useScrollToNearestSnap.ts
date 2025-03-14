import debounce from 'lodash/debounce'
import { useCallback, useEffect, useRef } from 'react'

export function useScrollToNearestSnap(snapClassName: string) {
  const prevScrollY = useRef(window.scrollY)

  const isScrolling = useRef(false)
  const scrollToNearestSnap = useCallback(
    debounce(() => {
      if (isScrolling.current) return
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - prevScrollY.current

      if (Math.abs(scrollDelta) < 20) return
      const direction = scrollDelta > 0 ? 'down' : 'up'

      const snapElements = Array.from(document.querySelectorAll(`.${snapClassName}`))
      if (snapElements.length === 0) return

      const viewportHeight = window.innerHeight
      const viewportCenter = currentScrollY + viewportHeight / 3

      let nearestElement: HTMLElement | null = null
      let nearestDistance = Infinity

      snapElements.forEach((el) => {
        const elRect = el.getBoundingClientRect()
        const elCenter = currentScrollY + el.getBoundingClientRect().top + elRect.height / 2
        const eleTop = currentScrollY + el.getBoundingClientRect().top
        const eleBottom = currentScrollY + el.getBoundingClientRect().bottom
        const isElementInDirection =
          (direction === 'down' && elCenter > viewportCenter) || (direction === 'up' && elCenter < viewportCenter)

        const isDown = direction === 'down'
        if (isElementInDirection) {
          const distance = isDown ? eleTop - viewportCenter : viewportCenter - eleBottom
          if (distance > 0 && distance < nearestDistance) {
            nearestDistance = distance
            nearestElement = el as HTMLElement
          }
        }
      })

      if (nearestElement && nearestDistance > 20) {
        const el = nearestElement as HTMLElement
        const rect = el.getBoundingClientRect()

        console.log('scrolling to', el, nearestDistance)
        isScrolling.current = true
        window.scrollTo({ top: el.offsetTop - window.innerHeight * 0.1, behavior: 'smooth' })

        setTimeout(() => {
          isScrolling.current = false
          prevScrollY.current = window.scrollY
        }, 1500)
      }

      prevScrollY.current = currentScrollY
    }, 50),
    [snapClassName],
  )

  useEffect(() => {
    window.addEventListener('scroll', scrollToNearestSnap, { passive: true })
    return () => window.removeEventListener('scroll', scrollToNearestSnap)
  }, [scrollToNearestSnap])
}
