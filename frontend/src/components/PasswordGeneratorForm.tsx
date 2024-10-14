import { useForm } from 'react-hook-form'
import { Flip, toast } from 'react-toastify'
import { Input } from '../components/ui/input'
import { useState } from 'react'
import { useEffect } from 'react'
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
} from '../components/ui/form'

const PasswordGeneratorForm = () => {	
	const MIN_PASSWORD_LEN = 10
	const MAX_PASSWORD_LEN = 64
	// initial state, and functions to change state
	const [passwordType, setPasswordType] = useState('password')
	const [hasSpecialChars, setHasSpecialChars] = useState(true)
	const [hasNumbers, setHasNumbers] = useState(true)
	const [hasUppercase, setHasUppercase] = useState(true)
	const [hasLowercase, setHasLowercase] = useState(true)
	const [passwordLength, setPasswordLength] = useState(MIN_PASSWORD_LEN)
	const [password, setPassword] = useState('');
	const [isCopied, setIsCopied] = useState(false);
	const [isBadLength, setIsBadLength] = useState(false)

	const form = useForm({
		defaultValues: {
			length: passwordLength,
		}
	})

	// handling state for radio buttons for password type
	const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordType(e.target.value)
	}

	// handling state for password length
	const handlePasswordLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPasswordLength(Number(e.target.value))
	}
	// setting the most recent value of password length immediately after it has changed
	useEffect(() => {
		console.log(`Password length now: ${passwordLength}`)
	}, [passwordLength])

	// handling  state for individual checkboxes for other options
	const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { id, checked } = e.target

		switch (id) {
			case 'special-chars':
				setHasSpecialChars(checked)
				break;
			case 'numbers':
				setHasNumbers(checked)
				break;
			case 'uppercase':
				setHasUppercase(checked)
				break;
			case 'lowercase':
				setHasLowercase(checked)
				break;
		}
	}

	// copying the password
	const copyPassword = () => {
		navigator.clipboard.writeText(password)
		.then(() => {
			setIsCopied(true)
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
	// Character sets for password generation
	const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
	const numbers = '0123456789';
	const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const lowercase = 'abcdefghijklmnopqrstuvwxyz';

	const generatePassword = (passwordLength: number) => {
		if (passwordLength < MIN_PASSWORD_LEN || passwordLength > MAX_PASSWORD_LEN) {
			setIsBadLength(true)
			return
		}

		setIsBadLength(false)
		const getRandomInt = (min: number, max: number) => {
			// secure, non-deterministic random number generation
			return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (max - min + 1)) + min;
		}

		let possibleChars = ''
		let generatedPassword = ''

		// check the lowercase option by default if none are selected
		if (!hasSpecialChars && !hasUppercase && !hasLowercase && !hasNumbers) {
			setHasLowercase(true)
		}
		if (hasSpecialChars) possibleChars += specialChars
		if (hasUppercase) possibleChars += uppercase
		if (hasLowercase) possibleChars += lowercase
		if (hasNumbers) possibleChars += numbers

		for (let i = 0; i < passwordLength; i++) {
			const randomIndex = getRandomInt(0, possibleChars.length - 1) // 0 - last index of possibleChars
			generatedPassword += possibleChars[randomIndex]
		}
		setPassword(generatedPassword)
	}

	// Generate a password every time any of the checkboxes change
	useEffect(() => {
		generatePassword(passwordLength);
	}, [hasSpecialChars, hasNumbers, hasUppercase, hasLowercase, passwordLength]);

	return (
		<div id='form-container' className='p-10 w-3/4 rounded-lg flex flex-col justify-center gap-6
			border border-slate-400 min-w-96'>
			<Form {...form}>
				<h1 className='text-2xl text-center m-0'>Password generator</h1>
				<hr />

				{/* password display area */}
				<div id='password-display' className={`bg-slate-100 border w-full min-h-16 rounded-lg p-4 text-2xl
					text-center text-sky-900 break-words ${isCopied ? 'bg-slate-200': ''}`}>
					{password}
				</div>

				<div className='flex gap-4 sm:max-lg:block'>
					{/* password or passphrase */}
					<div className='h-fit w-1/2 p-3 flex flex-col gap-2 border border-slate-200 rounded-lg
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

					{/* password length */}
					<FormField
						control={form.control}
						name="length"
						render={({ field }) => (
							<FormItem className='w-1/2 sm:max-lg:w-full'>
								<FormLabel className='text-xl ml-3'>Length</FormLabel>
								<FormControl>
									<Input type='number' autoFocus className={`h-12 text-xl border border-slate-400
										placeholder:text-slate-300 placeholder:font-light hover:border-slate-500 hover:border-2
										${isBadLength ? ' hover:border-orange-700 border-2 border-orange-700' : ''}`}
									placeholder='Length of the password' {...field}
									onChange={(e) => {
										field.onChange(e); // Track with react hook form
										handlePasswordLengthChange(e) // custom function
									}}
									/>
								</FormControl>
								 {/* Conditionally render the error message */}
								{isBadLength && (
									<p className="text-orange-800 text-md mt-2">
									{`Password must be between ${MIN_PASSWORD_LEN} and ${MAX_PASSWORD_LEN} characters.`}
									</p>
								)}
							</FormItem>
						)}
					/>
				</div>

				{/* additional options */}
				<div className='h-fit w-full p-3 flex flex-col gap-2 border border-slate-200 rounded-lg'>
					<h2 className='text-xl m-0 font-medium'>Options</h2>
					<hr />
					<div className='flex gap-x-8 flex-wrap gap-y-2'>
						<div className='flex gap-2'>
							<input type="checkbox" id="special-chars" name='password-type' value='special-chars'
							checked={hasSpecialChars}
							onChange={handleOptionsChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="special-chars">special characters</label>
						</div>
						<div className='flex gap-2'>
							<input type="checkbox" id="numbers" name='password-type' value='numbers'
							checked={hasNumbers}
							onChange={handleOptionsChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="numbers">numbers</label>
						</div>
						<div className='flex gap-2'>
							<input type="checkbox" id="uppercase" name='password-type' value='numbers'
							checked={hasUppercase}
							onChange={handleOptionsChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="uppercase">uppercase</label>
						</div>
						<div className='flex gap-2'>
							<input type="checkbox" id="lowercase" name='password-type' value='numbers'
							checked={hasLowercase}
							onChange={handleOptionsChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="lowercase">lowercase</label>
						</div>
					</div>
				</div>
				<div className='w-full flex gap-5 sm:max-lg:block sm:max-lg:mt-4'>
					<button
						// variant='secondary'
						className='btn-primary btn-secondary sm:max-lg:mb-5'
						onClick={() => generatePassword(passwordLength)}>
							Regenerate
					</button>
					<button
						// variant='secondary'
						className='btn-primary'
						onMouseDown={() => {
							copyPassword()
						}}
						onMouseUp={() => {
							setIsCopied(false)
						}}
						>
							Copy password
					</button>
				</div>
			</Form>
		</div>
	)
}

export default PasswordGeneratorForm;
