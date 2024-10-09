import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import Sidebar from './components/Sidebar'
import PasswordGenerator from './pages/PasswordGenerator'
import Passwords from './pages/Passwords'
import './styles/App.css'

const App = () => {

  return (
    <Router>
		<div id='app-container'>
			{/* Sidebar that remains static */}
			<Sidebar />
			{/* Right side page with content */}
			<div id='content-area'>
				<Routes>
					<Route path='/passwords' element={<Passwords/>}></Route>
					<Route path="/generator" element={<PasswordGenerator />} />
				</Routes>
			</div>
		</div>
	</Router>
  )
}

export default App
