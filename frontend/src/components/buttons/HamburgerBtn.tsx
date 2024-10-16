import React from 'react'

// typing for hamburger button props
interface HamburgerBtnProps {
	setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
	isSidebarOpen: boolean
}

const HamburgerBtn: React.FC<HamburgerBtnProps> = ({ setIsSidebarOpen, isSidebarOpen}) => {
	return (
		<button
			className='z-30 w-12 h-auto border-2 border-slate-400 rounded
			hover:bg-slate-300
			flex items-center justify-center'
			onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
			<svg width="30px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M20 7L4 7" stroke="#1C274C" strokeWidth="2" strokeLinecap="round"/>
				<path d="M20 12L4 12" stroke="#1C274C" strokeWidth="2" strokeLinecap="round"/>
				<path d="M20 17L4 17" stroke="#1C274C" strokeWidth="2" strokeLinecap="round"/>
			</svg>
			{/* Hamburger Icon */}
		</button>
	)
}

export default HamburgerBtn;
