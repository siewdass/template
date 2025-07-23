const isProd = (import.meta as any).env.PROD

// Función wrapper para crear logs consistentes
const createLog = (level: 'INFO' | 'WARN' | 'ERROR', color: string) => 
	(msg: string, obj?: object) => {
		if (level === 'INFO' && isProd) return
    
		const plainObj = obj ? createPlainObject(obj) : undefined
		console.info(
			`%c[${level}]%c ${msg}`,
			`color: ${color}; font-weight: bold;`,
			'color: gray;',
			plainObj
		)
	}

// Helper para crear objetos planos
const createPlainObject = (obj: object) => {
	const o = Object.create(null)
	Object.keys(obj).forEach(k => (o[k] = (obj as any)[k]))
	return o
}

// Logger exportado
export const logger = {
	info: createLog('INFO', 'green'),
	warn: createLog('WARN', 'orange'),
	error: createLog('ERROR', 'red'),
}