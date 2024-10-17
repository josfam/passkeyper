/** For favicon extraction logic */


/**
 * Extracts the favicon url for this site
 * @param url The url from which the favicon url should be extracted
 * @returns The url of the favicon on this site
 */
const extractFaviconUrl = async (url: string): Promise<string> => {
	const defaultIconLocation = '../../public/icons/default-password-icon.ico'
	let protocoledUrl = url;
	// guess an 'https' protocol if no protocol exists
	if (!(url.startsWith('https') || url.startsWith('http'))) {
		protocoledUrl = 'https://' + url;
	}

	try {
		const urlObj = new URL(protocoledUrl);
		const iconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
		const response = await fetch(iconUrl, {
			method: 'HEAD' // just checking the header, not interested in the body
		})
		if (response.ok) {
			return iconUrl;
		}
		return defaultIconLocation;
	} catch {
		console.log("We couldn't get this website's icon");
		return defaultIconLocation
	}
}

export default extractFaviconUrl;
