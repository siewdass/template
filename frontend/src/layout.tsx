import { Navigation } from './components/navigation'
import { Flex } from './components/flex'
import { Header } from './components/header'
import { Divider } from 'primereact/divider'

export const Layout = ( { children }: any ) => {
	return (
		<Flex width={'100%'} height={'100vh'} flexDirection='column'>
			<Header />
			<Flex flexDirection='row' width={'100%'}>
				<Navigation />
				<Divider layout="vertical" className='nospacing'/>
				<Flex padding={20} width="100%">
					{ children }
				</Flex>
			</Flex>
		</Flex>
	)
}