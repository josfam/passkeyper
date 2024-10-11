import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from '../components/ui/input'
import { useState } from 'react'
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
} from '../components/ui/form'
import { Button } from '../components/ui/button'

// zod form schema for validation
const formSchema = z.object({
	length: z.number()
	.min(6, {message: 'Must have 6 at least'})
	.max(80, {message: '80 characters may be too long!'}),
	passwordType: z.enum(['password', 'passphrase'])
});


const PasswordGeneratorForm = () => {
	const form = useForm({
		resolver: zodResolver(formSchema)
	})

	// logic for populating the password box based on state of checkboxes
	const [isPassword, setIsPassword] = useState(true)
	const [isPassphrase, setIsPassphrase] = useState(false)
	const [hasSpecialChars, setHasSpecialChars] = useState(true)
	const [hasNumbers, setHasNumbers] = useState(true)
	const [hasUppercase, setHasUppercase] = useState(true)
	const [hasLowercase, setHasLowercase] = useState(true)

	const handleRadioChange = () => {
		alert('Radio changed')
	}
	const handleCheckBoxChange = () => {
		alert('Checkbox changed')
	}

	return (
		<div id='form-container' className='p-10 w-3/4 rounded-lg flex flex-col justify-center gap-6
			border border-slate-400 min-w-96'>
			<Form {...form}>
				<h1 className='text-2xl text-center m-0'>Password generator</h1>
				<hr />
				{/* password display area */}
				<div id='password-display' className='bg-slate-100 border w-full min-h-16 rounded-lg'>
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
								checked={isPassword}
								onChange={handleRadioChange}/>
								<label className='text-xl' htmlFor="password">password</label>
							</div>
							<div className='flex gap-2'>
								<input type="radio" id="passphrase" name='password-type' value='passphrase'
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
									<Input type='number' autoFocus className='h-12 text-xl border border-slate-400
										placeholder:text-slate-300 placeholder:font-light
										hover:border-slate-500 hover:border-2'
									placeholder='Length of the password' {...field}/>
								</FormControl>
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
							onChange={handleCheckBoxChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="special-chars">special characters</label>
						</div>
						<div className='flex gap-2'>
							<input type="checkbox" id="numbers" name='password-type' value='numbers'
							onChange={handleCheckBoxChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="numbers">numbers</label>
						</div>
						<div className='flex gap-2'>
							<input type="checkbox" id="uppercase" name='password-type' value='numbers'
							onChange={handleCheckBoxChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="uppercase">uppercase</label>
						</div>
						<div className='flex gap-2'>
							<input type="checkbox" id="lowercase" name='password-type' value='numbers'
							onChange={handleCheckBoxChange}
							className='radial-check'/>
							<label className='text-xl' htmlFor="lowercase">lowercase</label>
						</div>
					</div>
				</div>
				<div className='w-full flex gap-5 sm:max-lg:block sm:max-lg:mt-4'>
					<button
						// variant='secondary'
						className='btn-primary btn-secondary sm:max-lg:mb-5'>
							Regenerate
					</button>
					<button
						// variant='secondary'
						className='btn-primary'>
							Copy password
					</button>
				</div>
			</Form>
		</div>
	)
}

export default PasswordGeneratorForm;
