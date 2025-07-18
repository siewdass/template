
import { Toolbar } from 'primereact/toolbar';
import { Avatar } from 'primereact/avatar';
import { Badge } from 'primereact/badge';
import { Flex } from './flex';

export const Header = () => {

	return (
		<Toolbar
		
			start={
				<span style={{fontSize: 20}}>Brand</span>
			}
			end={
				<Flex gap={20}>
					<Avatar className="p-overlay-badge" icon="pi pi-bell">
						<Badge value="4" />
					</Avatar>
					<Avatar className="p-overlay-badge" icon="pi pi-user">
					</Avatar>
				</Flex>
			}
		/>
	)
}