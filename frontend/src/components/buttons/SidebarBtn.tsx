import { forwardRef } from 'react';
import { Button } from '../ui/button';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Interface for typing props
interface SidebarBtnProps {
	buttonIcon: IconProp;
	buttonLabel: string;
	pageIsInView: boolean;
}

const SidebarBtn = forwardRef<HTMLButtonElement, SidebarBtnProps>(
	({ buttonIcon, buttonLabel='', pageIsInView = false, ...otherProps }, ref) => {
	return (
		<Button
		ref={ref} // attach the reference to the button
		variant='ghost'
		className={`w-full rounded-none text-xl h-16 flex-auto gap-6 px-14
			hover:underline hover:underline-offset-8 hover:decoration-1 active:bg-slate-400 active:text-white
			${pageIsInView ? 'bg-slate-500 text-slate-50 hover:bg-slate-500 hover:text-slate-50' : 'hover:bg-slate-300'}
			`} size='lg'
		{...otherProps} // pass on other properties like onClick, and so on
		>
			<FontAwesomeIcon icon={ buttonIcon } />
			<div className='mr-auto'>
				{ buttonLabel }
			</div>
		</Button>
	)
}
);

export default SidebarBtn;
