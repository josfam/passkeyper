import { zxcvbn } from "@zxcvbn-ts/core"

interface weakPasswordProps {
	masterPassword: string,
}

const checkWeakPassword = ({ masterPassword }: weakPasswordProps) => {
	const strengthReport = zxcvbn(masterPassword);
	return strengthReport;
}

export default checkWeakPassword
