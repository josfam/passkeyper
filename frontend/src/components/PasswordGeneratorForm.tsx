import { useForm, UseFormReturn } from 'react-hook-form'
import { Flip, toast } from 'react-toastify'
import { useState} from 'react'
import {
	Form,
} from '../components/ui/form'
import PasswordOptions from './PasswordOptions'
import { MIN_PASSWORD_LEN } from '../utils/passwords/Constants'

const PasswordGeneratorForm = () => {
	// initial state, and functions to change state
	const [passwordType, setPasswordType] = useState('password')
	const [password, setPassword] = useState('');
	const [highlightPasswordArea, setHighlightPasswordArea] = useState(false);
	const [regenerateTrigger, setRegenerateTrigger] = useState(0);

	const form: UseFormReturn<{ length: number; }, undefined> = useForm({
		defaultValues: {
			length: MIN_PASSWORD_LEN,
		}
	})

	// handling state for radio buttons for password type
	const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordType(e.target.value)
	}

	// Force a regeneration of the password by updating regenerate trigger
	const regeneratePassword = () => {
		setRegenerateTrigger(prev => prev + 1);
	}

	// copying the password
	const copyPassword = () => {
		navigator.clipboard.writeText(password)
		.then(() => {
			setHighlightPasswordArea(true)
			toast.success('Password copied to the clipboard',{
				autoClose: 1500,
				pauseOnFocusLoss: false,
				hideProgressBar: true,
				position: 'top-right',
				transition: Flip
			})
		})
		.catch((err) => {
			toast.error('Error copying password. Try again')
			console.log(err);
		})	
	}

	return (
		<div className='mx-auto pt-6 px-4'>
			<h1 className="text-3xl font-bold mb-9 text-center text-sky-900">Password generator</h1>
			<div className='container flex pb-12 flex-col items-center justify-center w-full h-full mb-10 md:mb-0 md:p-6'>
				<div id='form-container' className='p-10 w-full rounded-lg flex flex-col justify-center gap-6
					border border-slate-400 min-w-96 md:w-3/4'>
					<Form {...form}>
						{/* password display area */}
						<div className={`bg-slate-100 border w-full min-h-16 rounded-lg p-4 text-2xl
							text-center text-sky-900 break-words ${highlightPasswordArea ? 'bg-slate-200': ''} select-all`}>
							{password}
						</div>

						<div className='flex flex-col gap-4 md:block'>
							{/* password or passphrase */}
							<div className='h-fit w-full p-3 flex flex-col gap-2 border border-slate-200 rounded-lg
							sm:mb-4 sm:max-lg:w-full'>
								<h2 className='text-xl m-0 font-medium'>Type</h2>
								<hr />
								<div className='flex flex-wrap gap-x-8 gap-y-2'>
									<div className='flex gap-2'>
										<input type="radio" id="password" name='password-type' value='password'
										className='radial-check'
										checked={passwordType === 'password'}
										onChange={handleRadioChange}/>
										<label className='text-xl' htmlFor="password">password</label>
									</div>
									<div className='flex gap-2'>
										<input type="radio" id="passphrase" name='password-type' value='passphrase'
										checked={passwordType === 'passphrase'}
										className='radial-check'
										onChange={handleRadioChange}/>
										<label className='text-xl' htmlFor="passphrase">passphrase</label>
									</div>
								</div>
							</div>
							{ passwordType === 'password' ? (
								<>
								{/* handle password generation and options */}
									{<PasswordOptions
									setPassword={setPassword}
									form={form}
									regenerateTrigger={regenerateTrigger} // Force a refresh by updating the trigger
									/>}
								</>
								) : (
									<>
									</>
								)
							}
						</div>
						<div className='w-full flex flex-col-reverse gap-5 md:flex md:flex-row mt-4 sm:mt-0'>
							<button
								className='btn-primary btn-secondary sm:max-lg:mb-5'
								onMouseDown={() => {setHighlightPasswordArea(true)}}
								onMouseUp={() => {setHighlightPasswordArea(false)}}
								onClick={() => regeneratePassword()}
								>
									Regenerate
							</button>
							<button
								className='btn-primary'
								onMouseDown={() => {copyPassword()}}
								onMouseUp={() => {setHighlightPasswordArea(false)}}
								>
									Copy
							</button>
						</div>
					</Form>
				</div>
			</div>
		</div>
	)
}

export default PasswordGeneratorForm;
