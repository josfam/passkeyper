import { Link } from 'react-router-dom';
import { faKey, faTrash } from "@fortawesome/free-solid-svg-icons";

// import '../styles/Sidebar.scss'
import ToolsDropDown from './ToolsDropdown';
import SidebarBtn from './buttons/SidebarBtn';

const Sidebar = () => {
	// dropdown state

	return (
		<div className="min-w-64">
			<ul className="
			min-h-screen
			bg-slate-200
			p-0 m-0
			text-center
			">
				<li><Link to="/passwords"><SidebarBtn buttonIcon={faKey} buttonLabel='Passwords'/></Link></li>
				<li><ToolsDropDown/></li>
				<li><Link to="/trash"><SidebarBtn buttonIcon={faTrash} buttonLabel='Trash'/></Link></li>
			</ul>
		</div>
	)
}

export default Sidebar;
