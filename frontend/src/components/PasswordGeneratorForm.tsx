import { useForm, UseFormReturn } from 'react-hook-form'
import { Flip, toast } from 'react-toastify'
import { useState} from 'react'
import {
	Form,
} from '../components/ui/form'
import PasswordOptions from './PasswordOptions'
import PassphraseOptions from './PassphraseOptions'
import { DEFAULT_SEPARATOR, MIN_PASSPHRASE_LEN, MIN_PASSWORD_LEN } from '../utils/passwords/Constants'

const PasswordGeneratorForm = () => {
	// initial state, and functions to change state
	const [passwordType, setPasswordType] = useState('password')
	const [password, setPassword] = useState('');
	const [highlightPasswordArea, setHighlightPasswordArea] = useState(false);
	const [newPasswordTrigger, setNewPasswordTrigger] = useState(0);
	const [newPassphraseTrigger, setNewPassphraseTrigger] = useState(0);

	const form: UseFormReturn<{ passwordLength: number; passphraseLength: number; separator: string }, undefined> = useForm({
		defaultValues: {
			passwordLength: MIN_PASSWORD_LEN,
			passphraseLength: MIN_PASSPHRASE_LEN,
			separator: DEFAULT_SEPARATOR
		}
	})

	// handling state for radio buttons for password type
	const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordType(e.target.value)
		if (passwordType === 'password') {
			regeneratePassword()
		} else {
			regeneratePassphrase()
		}
	}

	// Force a regeneration of the password by updating regenerate trigger
	const regeneratePassword = () => {
		setNewPasswordTrigger(prev => prev + 1);
	}
	// Force a regneration of the passphrase by updating regenerate trigger
	const regeneratePassphrase = () =>  {
		setNewPassphraseTrigger(prev => prev + 1);
	}

	// copying the password
	const copyPassword = () => {
		navigator.clipboard.writeText(password)
		.then(() => {
			setHighlightPasswordArea(true)
			toast.success(`${
				passwordType.charAt(0).toUpperCase() + passwordType.slice(1)
			} copied to the clipboard`,{
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
		<div className='mx-auto'>
			<h1 className="page-header">Password generator</h1>
			<div className='container flex flex-col items-left justify-center w-full h-full'>
				<div id='form-container' className='card-shadow p-8 w-full rounded-lg flex flex-col justify-center gap-1
					min-w-96 md:w-3/4 lg:w-1/2'>
					<Form {...form}>
						{/* password display area */}
						<div className={`bg-slate-100 border w-full flex items-center justify-center overflow-y-scroll rounded-lg p-4 text-2xl
							${passwordType === 'passphrase' ? 'md:h-32': ''}
							text-center text-sky-900 break-words ${highlightPasswordArea ? 'bg-slate-200': ''} select-all`}>
							{password}
						</div>

						<div className='flex flex-col gap-4 md:block'>
							{/* password or passphrase */}
							<div className='h-fit w-full p-3 flex flex-col gap-2 border border-slate-200 rounded-lg
							sm:mb-4 sm:max-lg:w-full'>
								<h2 className='text-lg m-0 font-medium'>Type</h2>
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
									{/* show password generation options */}
									<PasswordOptions
									setPassword={setPassword}
									form={form}
									newPasswordTrigger={newPasswordTrigger} // Force a refresh by updating the trigger
									/>
								</>
								) : (
								<>
									{/* show passphrase generation options */}
									<PassphraseOptions
									setPassword={setPassword}
									form={form}
									newPassphraseTrigger={newPassphraseTrigger}
									/>
								</>
								)
							}
						</div>
						<div className='w-full flex flex-col-reverse gap-5 md:flex md:flex-row mt-6'>
							<button
								className='btn-primary btn-secondary sm:max-lg:mb-5'
								onMouseDown={() => {setHighlightPasswordArea(true)}}
								onMouseUp={() => {setHighlightPasswordArea(false)}}
								onClick={
									() => passwordType === 'password' ? regeneratePassword() : regeneratePassphrase()
								}
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
