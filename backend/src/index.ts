import { Request } from 'express'

export default async function Endpoint(req: Request) {
	return {
		message: 'Hello World'
	}
}