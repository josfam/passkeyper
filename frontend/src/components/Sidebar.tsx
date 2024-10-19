import { Link, useLocation } from 'react-router-dom';
import { faKey, faTrash, faRightFromBracket, faGear, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

import ToolsDropDown from './ToolsDropdown';
import SidebarBtn from './buttons/SidebarBtn';

// Typing for sidebar properties
interface SidebarProps {
	isOpen: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
	// Get the current location on the page for conditional highlighting of buttons that match the page
	const currentPage = useLocation().pathname

	return (
		<div id='sidebar-container' className={` z-30 h-full min-w-64 ${isOpen ? 'flex' : 'hidden'} overflow-y-auto
		absolute inline-block 
		md:block md:relative`}>
			<ul id='sidebar-list' className='h-full overflow-y-auto flex bg-slate-200 p-0 m-0 text-center
			md:flex flex-col md:min-h-screen'
			>
				<div>
					<li><Link to='/passwords'><SidebarBtn pageIsInView={currentPage === '/passwords'}
					buttonIcon={faKey} buttonLabel='Passwords'/></Link></li>
					<li><ToolsDropDown/></li>
					<li><Link to='/dashboard'><SidebarBtn pageIsInView={currentPage === '/dashboard'}
					buttonIcon={faShieldHalved} buttonLabel='Dashboard'/></Link></li>
					<li><Link to='/trash'><SidebarBtn pageIsInView={currentPage === '/trash'}
					buttonIcon={faTrash} buttonLabel='Trash'/></Link></li>
				</div>
				<div className='mt-auto'>
					<li><Link to='/settings'><SidebarBtn pageIsInView={currentPage === '/settings'}
					buttonIcon={faGear} buttonLabel='Settings'/></Link></li>
					<li><Link to='/logout'><SidebarBtn pageIsInView={currentPage === '/logout'}
					buttonIcon={faRightFromBracket} buttonLabel='Logout'/></Link></li>
				</div>
			</ul>
		</div>
	)
}

export default Sidebar;
