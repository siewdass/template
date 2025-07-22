import util from 'util'

const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	gray: '\x1b[37m'
}

function colorText(color: string, text: string) {
	return `${color}${text}${colors.reset}`
}

const isProd = (import.meta as any).env.PROD

export const logger = {
	info: (msg: string, obj?: object) => {
		if (isProd) return
		const level = colorText(colors.green, '[INFO]')
		const message = colorText(colors.gray, msg)
		const extra = obj ? util.inspect(obj, { colors: true, depth: null }) : ''
		console.info(level, message, extra)
	},
	warn: (msg: string, obj?: object) => {
		const level = colorText(colors.yellow, '[WARN]')
		const message = colorText(colors.gray, msg)
		const extra = obj ? util.inspect(obj, { colors: true, depth: null }) : ''
		console.info(level, message, extra)
	},
	error: (msg: string, obj?: object) => {
		const level = colorText(colors.red, '[ERROR]')
		const message = colorText(colors.gray, msg)
		const extra = obj ? util.inspect(obj, { colors: true, depth: null }) : ''
		console.info(level, message, extra)
	},
}
