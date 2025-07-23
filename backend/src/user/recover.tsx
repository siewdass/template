import { MailSender } from '../../lib/mail'
import { Request } from 'express'

const HiUser = ({ user }: any) => (
	<html>
		<body>
			<h1>¡Hola {user}!</h1>
		</body>
	</html>
)

export default async (req: Request) => {
	const { user } = req.query

	await MailSender({
		from: 'siewdass@gmail.com',
		to: 'siewdass@gmail.com',
		subject: `¡Hola ${user}!`,
		element: <HiUser user={ user } />,
	})

	return { message: 'done' }
}
