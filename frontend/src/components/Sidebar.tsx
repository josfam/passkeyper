import { Link } from 'react-router-dom';
import { faKey, faTrash, faRightFromBracket, faGear } from '@fortawesome/free-solid-svg-icons';

// import '../styles/Sidebar.scss'
import ToolsDropDown from './ToolsDropdown';
import SidebarBtn from './buttons/SidebarBtn';

const Sidebar = () => {
	// dropdown state

	return (
		<div className='min-w-64'>
			<ul className='
			flex
			flex-col
			min-h-screen
			bg-slate-200
			p-0 m-0
			text-center
			'>
				<div>
					<li><Link to='/passwords'><SidebarBtn buttonIcon={faKey} buttonLabel='Passwords'/></Link></li>
					<li><ToolsDropDown/></li>
					<li><Link to='/trash'><SidebarBtn buttonIcon={faTrash} buttonLabel='Trash'/></Link></li>
				</div>
				<div className='
				mt-auto
				'>
					<li><Link to='/settings'><SidebarBtn buttonIcon={faGear} buttonLabel='Settings'/></Link></li>
					<li><Link to='/logout'><SidebarBtn buttonIcon={faRightFromBracket} buttonLabel='Logout'/></Link></li>
				</div>
			</ul>
		</div>
	)
}

export default Sidebar;
