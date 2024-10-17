import {
	SPECIAL_CHARS_LIST,
	NUMBERS_LIST,
	UPPERCASE_LIST,
	LOWERCASE_LIST,
	MIN_PASSWORD_LEN } from './Constants';

interface generationProps {
	passwordLength: number,
	hasSpecialChars: boolean,
	hasUppercase: boolean,
	hasLowercase: boolean,
	hasNumbers: boolean
}

const generatePassword = ({
	passwordLength = MIN_PASSWORD_LEN,
	hasSpecialChars = true,
	hasUppercase = true,
	hasLowercase = true,
	hasNumbers= true,
}: generationProps): string =>  {
	console.log(`length: ${passwordLength}\n special?: ${hasSpecialChars}\n upper?: ${hasUppercase}\n lower?: ${hasLowercase}\n numbers?: ${hasNumbers}`); // DEBUG
	let generatedPassword = '';
	let possibleChars = ''
	const getRandomInt = (min: number, max: number) => {
		// secure, non-deterministic random number generation
		return Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1) * (max - min + 1)) + min;
	}

	/**
	 * Returns one randomly picked character from the provided string
	 * @param chars The string from which to pick a single character
	 * @returns One randomly picked character from the provided string
	 */
	const pickOneChar = (chars: string) => {
		return chars[getRandomInt(0, chars.length - 1)];
	}

	/**
	 * Returns a shuffled version of the provided string
	 * @param chars The characters to shuffle
	 * @returns A shuffled version of the provided characters
	 */
	const shuffleChars = (chars: string) => {
		// Uses Fisher-Yates Shuffle (Knuth Shuffle) algorithm
		const charsArray = chars.split('');
		for (let i = charsArray.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1)); // Get a random index from 0 to i
			[charsArray[i], charsArray[j]] = [charsArray[j], charsArray[i]]; // Swap elements
		}
		return charsArray.join('');
	}

	// check the lowercase option by default if none are selected
	if (!hasSpecialChars && !hasUppercase && !hasLowercase && !hasNumbers) {
		hasLowercase = true
	}
	if (hasSpecialChars) {
		// ensure at least one special exists
		generatedPassword += pickOneChar(SPECIAL_CHARS_LIST);
		possibleChars += SPECIAL_CHARS_LIST
	}
	if (hasNumbers) {
		// ensure at least one number exists
		generatedPassword += pickOneChar(NUMBERS_LIST);
		possibleChars += NUMBERS_LIST
	}
	if (hasUppercase) {
		// ensure at least one uppercase character exists
		generatedPassword += pickOneChar(UPPERCASE_LIST);
		possibleChars += UPPERCASE_LIST
	}
	if (hasLowercase) {
		// ensure at least one lowercase character exists
		generatedPassword += pickOneChar(LOWERCASE_LIST);
		possibleChars += LOWERCASE_LIST
	}
	console.log(`generated password before loop:\n ${generatedPassword}`); // DEBUG
	// account for characters that may already be part of the generated password
	const availableSlots = passwordLength - generatePassword.length;
	for (let i = 0; i < availableSlots; i++) {
		const randomIndex = getRandomInt(0, possibleChars.length - 1) // 0 - last index of possibleChars
		generatedPassword += possibleChars[randomIndex]
	}

	return shuffleChars(generatedPassword);
}

export default generatePassword;
