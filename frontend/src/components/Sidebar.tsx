import { Link } from 'react-router-dom';
import { faKey, faTrash, faRightFromBracket, faGear } from '@fortawesome/free-solid-svg-icons';

import ToolsDropDown from './ToolsDropdown';
import SidebarBtn from './buttons/SidebarBtn';

// Typing for sidebar properties
interface SidebarProps {
	isOpen: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
	return (
		<div className={`min-w-64 ${isOpen ? 'flex' : 'hidden'}
		absolute inline-block
		md:block md:relative`}>
			<ul className='min-h-screen bg-slate-200 p-0 m-0 text-center
			md:flex flex-col md:min-h-screen'
			>
				<div>
					<li><Link to='/passwords'><SidebarBtn buttonIcon={faKey} buttonLabel='Passwords'/></Link></li>
					<li><ToolsDropDown/></li>
					<li><Link to='/trash'><SidebarBtn buttonIcon={faTrash} buttonLabel='Trash'/></Link></li>
				</div>
				<div className='mt-auto'>
					<li><Link to='/settings'><SidebarBtn buttonIcon={faGear} buttonLabel='Settings'/></Link></li>
					<li><Link to='/logout'><SidebarBtn buttonIcon={faRightFromBracket} buttonLabel='Logout'/></Link></li>
				</div>
			</ul>
		</div>
	)
}

export default Sidebar;
