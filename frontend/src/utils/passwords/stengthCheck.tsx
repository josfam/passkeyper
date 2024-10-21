import { zxcvbn } from "@zxcvbn-ts/core"

interface weakPasswordProps {
	masterPassword: string,
}

const checkWeakPassword = ({ masterPassword }: weakPasswordProps) => {
	const strengthReport = zxcvbn(masterPassword);
	console.log(strengthReport);
	return strengthReport;
}

export default checkWeakPassword
