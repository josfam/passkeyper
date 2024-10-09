import { Link } from 'react-router-dom';
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuGroup
} from './ui/dropdown-menu'

import SidebarBtn from './buttons/SidebarBtn';
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import '../styles/base.css'

const ToolsDropDown = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarBtn buttonIcon={faWrench} buttonLabel='Tools'/>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-60 p-0'>
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Link to='/generator' className='dropdown-item'
						>Password generator</Link>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Link to='/import-export' className='dropdown-item'>Import / Export</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default ToolsDropDown;
