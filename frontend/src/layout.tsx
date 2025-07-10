import { Navigation } from './components/navigation'
import { Flex } from './components/flex'
import { Divider } from 'primereact/divider';

export const Layout = ({ children }: any) => {
  return (
    <Flex width={'100%'} height={'100vh'}>
      <Navigation />
      <Divider layout="vertical" className='nospacing'/>
      
      <Flex padding={20}>
        { children }
      </Flex>
    </Flex>
  )
}