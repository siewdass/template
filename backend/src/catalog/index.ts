import { Request, Transaction } from '@lib/types'
import { Crud } from '@lib/database'

import { Catalog } from '@models/catalog'

export default async (request: Request, transaction: Transaction) => {
	return await Crud({
		request,
		model: Catalog 
	})
}