// Simple intersection observer hook that reports when an element first enters the viewport.
// Returns a ref to attach to the element and a boolean that stays true once in view.
import { useEffect, useRef, useState } from 'react'

export function useInViewOnce<T extends Element>(options?: IntersectionObserverInit) : { ref: React.RefObject<T>, inView: boolean } {
	const ref = useRef<T>(null)
	const [inView, setInView] = useState(false)

	useEffect(() => {
		if (inView) return // already observed
		const el = ref.current
		if (!el || typeof IntersectionObserver === 'undefined') return
		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					setInView(true)
					observer.disconnect()
					break
				}
			}
		}, options)
		observer.observe(el)
		return () => observer.disconnect()
	}, [inView, options])

	return { ref, inView }
}

export default useInViewOnce
