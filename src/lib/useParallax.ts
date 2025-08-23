// Lightweight parallax hook: returns a ref and a style object with translated Y based on scroll.
import { useEffect, useRef, useState } from 'react'

export function useParallax(multiplier = 0.3) : { ref: React.RefObject<HTMLElement>, style: React.CSSProperties } {
	const ref = useRef<HTMLElement>(null)
	const [offset, setOffset] = useState(0)

	useEffect(() => {
		function onScroll() {
			const el = ref.current
			if (!el) return
			const rect = el.getBoundingClientRect()
			const vh = window.innerHeight || 0
			const progress = 1 - Math.min(Math.max(rect.top / vh, 0), 1)
			setOffset(progress * multiplier * 100)
		}
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		window.addEventListener('resize', onScroll)
		return () => {
			window.removeEventListener('scroll', onScroll)
			window.removeEventListener('resize', onScroll)
		}
	}, [multiplier])

	return { ref, style: { transform: `translateY(${offset.toFixed(2)}px)` } }
}

export default useParallax
