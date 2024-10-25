import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
	MIN_PASSWORD_LEN,
	MAX_PASSWORD_LEN } from '../utils/passwords/Constants';
import generatePassword from '../utils/passwords/GeneratePassword';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
} from '../components/ui/form';
import { Input } from '../components/ui/input'


interface passwordOptionProps {
	setPassword: React.Dispatch<React.SetStateAction<string>>
	form: UseFormReturn<{ passwordLength: number; passphraseLength: number; separator: string }, undefined>
	newPasswordTrigger: number
}

const PasswordOptions = ({ setPassword, form, newPasswordTrigger} :passwordOptionProps) => {
	// initial state, and functions to change state
	const [hasSpecialChars, setHasSpecialChars] = useState(true)
	const [passwordLength, setPasswordLength] = useState(MIN_PASSWORD_LEN)
	const [hasNumbers, setHasNumbers] = useState(true)
	const [hasUppercase, setHasUppercase] = useState(true)
	const [hasLowercase, setHasLowercase] = useState(true)
	const [isBadLength, setIsBadLength] = useState(false)

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

	// Memoize the reference to getPassword, unless one of its dependencies changes
	const getPassword = useCallback((passwordLength: number) => {
		if (passwordLength < MIN_PASSWORD_LEN || passwordLength > MAX_PASSWORD_LEN) {
			setIsBadLength(true)
			return
		}
		setIsBadLength(false)
		if (!hasSpecialChars && !hasUppercase && !hasLowercase && !hasNumbers) {
			setHasLowercase(true)
		}
		const generatedPassword = generatePassword({ passwordLength, hasSpecialChars, hasUppercase, hasLowercase, hasNumbers });
		setPassword(generatedPassword)
	}, [hasSpecialChars, hasNumbers, hasUppercase, hasLowercase, setPassword]);

	useEffect(() => {
		getPassword(passwordLength);
	}, [getPassword, passwordLength, newPasswordTrigger])

	return (
		<div className='flex flex-col gap-6'>
			{/* password length */}
			<FormField
				control={form.control}
				name="passwordLength"
				render={({ field }) => (
					<FormItem className='w-full'>
						<FormLabel className='text-lg ml-3'>Length</FormLabel>
						<FormControl>
							<Input type='number' autoFocus className={`h-12 text-lg border border-slate-400
								placeholder:text-slate-300 placeholder:font-light hover:border-slate-500 hover:border-2
								${isBadLength ? ' hover:border-orange-700 border-2 border-orange-700' : ''}`}
							placeholder='Length of the password' {...field}
							onChange={(e) => {
								field.onChange(e); // Track with react hook form
								setPasswordLength(Number(e.target.value)); // custom function
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
			{/* additional options */}
			<div className='h-fit w-full p-3 flex flex-col gap-2 border border-slate-200 rounded-lg'>
				<h2 className='text-lg m-0 font-medium'>Options</h2>
				<hr />
				<div className='flex flex-col gap-x-8 gap-y-2 flex-wrap md:flex md:flex-row md:gap-y-2'>
					<div className='flex gap-2'>
						<input type="checkbox" id="special-chars" name='password-type' value='special-chars'
						checked={hasSpecialChars}
						onChange={handleOptionsChange}
						className='radial-check'/>
						<label className='text-lg' htmlFor="special-chars">special characters</label>
					</div>
					<div className='flex gap-2'>
						<input type="checkbox" id="numbers" name='password-type' value='numbers'
						checked={hasNumbers}
						onChange={handleOptionsChange}
						className='radial-check'/>
						<label className='text-lg' htmlFor="numbers">numbers</label>
					</div>
					<div className='flex gap-2'>
						<input type="checkbox" id="uppercase" name='password-type' value='numbers'
						checked={hasUppercase}
						onChange={handleOptionsChange}
						className='radial-check'/>
						<label className='text-lg' htmlFor="uppercase">uppercase</label>
					</div>
					<div className='flex gap-2'>
						<input type="checkbox" id="lowercase" name='password-type' value='numbers'
						checked={hasLowercase}
						onChange={handleOptionsChange}
						className='radial-check'/>
						<label className='text-lg' htmlFor="lowercase">lowercase</label>
					</div>
				</div>
			</div>
		</div>
	)
}

export default PasswordOptions;
