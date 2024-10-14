import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Sidebar from './components/Sidebar'
import Passwords from './pages/Passwords'
import './styles/App.css'
import './styles/base.css'
import 'react-toastify/ReactToastify.css'
import Trash from './pages/Trash'
import ImportExport from './pages/ImportExport'
import PasswordGenerator from './pages/PasswordGenerator'
import Settings from './pages/Settings'

const App = () => {

  return (
    <Router>
		<ToastContainer/> {/* Toast notifications */}
		<div id='app-container'
		className='inline-flex w-full'>
			{/* Sidebar that remains static */}
			<Sidebar />
			{/* Right side page with content */}
			<div id='content-area' className='
				bg-white'>
				<Routes>
					<Route path='/passwords' element={<Passwords/>}></Route>
					<Route path="/trash" element={<Trash />} />
					<Route path='/import-export' element={<ImportExport/>} />
					<Route path='/generator' element={<PasswordGenerator/>} />
					<Route path='/settings' element={<Settings/>} />
				</Routes>
			</div>
		</div>
	</Router>
  )
}

export default App