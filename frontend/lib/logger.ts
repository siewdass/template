const isProd = (import.meta as any).env.PROD

export const logger = {
	info: (msg: string, obj?: object) => {
		if (isProd) return // en prod no mostramos info
		const plainObj = obj
			? (() => {
				const o = Object.create(null)
				Object.keys(obj).forEach(k => (o[k] = (obj as any)[k]))
				return o
			})()
			: undefined
		console.info('%c[INFO]%c ' + msg, 'color: green; font-weight: bold;', 'color: gray;', plainObj)
	},
	warn: (msg: string, obj?: object) => {
		const plainObj = obj
			? (() => {
				const o = Object.create(null)
				Object.keys(obj).forEach(k => (o[k] = (obj as any)[k]))
				return o
			})()
			: undefined
		console.info('%c[WARN]%c ' + msg, 'color: orange; font-weight: bold;', 'color: gray;', plainObj)
	},
	error: (msg: string, obj?: object) => {
		const plainObj = obj
			? (() => {
				const o = Object.create(null)
				Object.keys(obj).forEach(k => (o[k] = (obj as any)[k]))
				return o
			})()
			: undefined
		console.info('%c[ERROR]%c ' + msg, 'color: red; font-weight: bold;', 'color: gray;', plainObj)
	},
}
