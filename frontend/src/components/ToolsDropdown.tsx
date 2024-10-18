import { Link, useLocation} from 'react-router-dom';
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
	// Get the current location on the page for conditional highlighting of buttons that match the page
	const currentPage = useLocation().pathname

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<SidebarBtn pageIsInView={currentPage === ''} buttonIcon={faWrench} buttonLabel='Tools'/>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-60 p-0'>
				<DropdownMenuGroup>
					<DropdownMenuItem className='px-0 py-0'>
						<Link to='/generator' className={`dropdown-item
							${currentPage === '/generator' ? 'bg-slate-500 text-slate-50' : ''} `}>Password generator</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className='px-0 py-0'>
						<Link to='/import-export' className={`dropdown-item
							${currentPage === '/import-export' ? 'bg-slate-500 text-slate-50' : ''}`}>Import / Export</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

export default ToolsDropDown;
