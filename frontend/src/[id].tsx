import { Route } from '@lib/types'

export default ({ params }: Route) => {

	return (
		<>{params.id}</>
	)
}