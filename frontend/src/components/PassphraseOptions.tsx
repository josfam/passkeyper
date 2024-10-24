import React, { useCallback, useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import wordList from '../utils/passwords/Wordlist';
import {
	MIN_PASSPHRASE_LEN,
	MAX_PASSPHRASE_LEN,
	DEFAULT_SEPARATOR,
	MAX_WORD_ID,
	MIN_WORD_ID} from '../utils/passwords/Constants';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl
} from './ui/form';
import { Input } from './ui/input';

interface passphraseOptionProps {
	setPassword: React.Dispatch<React.SetStateAction<string>>
	form: UseFormReturn<{ passwordLength: number; passphraseLength: number; separator: string }, undefined>
	newPassphraseTrigger: number
}

const PassphraseOptions = ({ setPassword, form, newPassphraseTrigger } :passphraseOptionProps) => {
	const [passphraseLength, setPassphraseLength] = useState(MIN_PASSPHRASE_LEN);
	const [separator, setSeparator] = useState(DEFAULT_SEPARATOR);
	const [isBadSeparator, setIsBadSeparator] = useState(false);
	const [isBadLength, setIsBadLength] = useState(false);

	/**
	 * Generates a cryptographically secure random number within the word list range
	 * @returns A cryptographically secure random number within the word list range
	 */
	const getWordId = () => {
		const range = MAX_WORD_ID - MIN_WORD_ID + 1
		return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (range)) + MIN_WORD_ID;
	}

	// Memoize the reference to getPassphrase, unless one of its dependencies changes
	const getPassphrase = useCallback(() => {
		// passphrase number must be in range
		if (passphraseLength < MIN_PASSPHRASE_LEN || passphraseLength > MAX_PASSPHRASE_LEN) {
			setIsBadLength(true);
			return
		}
		if (separator.length > 1) {
			setIsBadSeparator(true);
			return
		} else if (separator.length === 0) {
			setSeparator(DEFAULT_SEPARATOR)
		}
		setIsBadLength(false)
		setIsBadSeparator(false)

		// collect word ids
		const wordIds: number[] = []
		for (let i = 0; i < passphraseLength; i++) {
			wordIds.push(getWordId())
		}
		// get words from array of word ids
		const words: string[] = []
		for (let i = 0; i < wordIds.length; i++) {
			words.push(wordList[wordIds[i].toString()]);
		}
		setPassword(words.join(separator));
	}, [passphraseLength, separator, setPassword]);

	useEffect(() => {
		getPassphrase()
	}, [newPassphraseTrigger, getPassphrase])

	return (
		<div className='flex flex-col gap-4 md:flex-row sm:gap-6'>
			{/* password length */}
			<FormField
				control={form.control}
				name="passphraseLength"
				render={({ field }) => (
					<FormItem className='w-full'>
						<FormLabel className='text-xl ml-3'>Length</FormLabel>
						<FormControl>
							<Input type='number' autoFocus className={`h-12 text-xl border border-slate-400
								placeholder:text-slate-300 placeholder:font-light hover:border-slate-500 hover:border-2
								${isBadLength ? ' hover:border-orange-700 border-2 border-orange-700' : ''}`}
								placeholder='Length of the passphrase' {...field}
								onChange={(e) => {
									field.onChange(e); // Track with react hook form
									setPassphraseLength(Number(e.target.value)); // custom function
									}
								}
								onFocus={(e) => {
									setPassphraseLength(Number(e.target.value)); // custom function
									} 
								}
							/>
						</FormControl>
						{/* Conditionally render the error message */}
						{isBadLength && (
							<p className="text-orange-800 text-md mt-2">
							{`Passphrase must be between ${MIN_PASSPHRASE_LEN} and ${MAX_PASSPHRASE_LEN} characters.`}
							</p>
						)}
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name="separator"
				render={({ field }) => (
					<FormItem className='w-full'>
						<FormLabel className='text-xl ml-3'>Separator</FormLabel>
						<FormControl>
							<Input type='text' autoFocus className={`h-12 text-xl border border-slate-400
								placeholder:text-slate-300 placeholder:font-light hover:border-slate-500 hover:border-2
								${isBadLength ? ' hover:border-orange-700 border-2 border-orange-700' : ''}`}
								placeholder='Separator between words' {...field}
								onChange={(e) => {
									field.onChange(e); // Track with react hook form
									setSeparator(e.target.value); // custom function
									}
								}
								onFocus={(e) => {
									setSeparator(e.target.value); // custom function
									}
								}
							/>
						</FormControl>
						{/* Conditionally render the error message */}
						{isBadSeparator && (
							<p className="text-orange-800 text-md mt-2">
							{`Separator can only contain one character`}
							</p>
						)}
					</FormItem>
				)}
			/>
		</div>
	);
}

export default PassphraseOptions;
