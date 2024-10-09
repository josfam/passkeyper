import { Link } from 'react-router-dom';

import '../styles/Sidebar.css'

const Sidebar = () => {
	// dropdown state

	return (
		<div id='sidebar'>
			<ul>
				<li><Link to="/passwords">passwords</Link></li>
				<li><Link to="/generator">password generator</Link></li>
			</ul>
		</div>
	)
}

export default Sidebar;
