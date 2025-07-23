import { useEffect as useeffect, useRef, EffectCallback, DependencyList } from 'react'

export const useEffect = (effect: EffectCallback, dependency: DependencyList = []) => {
	const init = useRef(false)

	useeffect(() => {
		if (!init.current) {
			init.current = true
			return effect()
		}
	}, dependency)
}