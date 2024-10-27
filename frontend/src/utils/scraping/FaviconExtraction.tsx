/** For favicon extraction logic */

/**
 * Extracts the favicon url for this site
 * @param url The url from which the favicon url should be extracted
 * @returns The url of the favicon on this site
 */
const getFaviconUrl = (url: string): string => {
	let protocoledUrl = url;
	// guess an 'https' protocol if no protocol exists
	if (!(url.startsWith('https') || url.startsWith('http'))) {
		protocoledUrl = 'https://' + url;
	}
  const urlObj = new URL(protocoledUrl);
  const host = urlObj.host
  /* use duckduckgo's api for fetching favicons, with the format: https://icons.duckduckgo.com/ip3/<domain name>.ico */
  return `https://icons.duckduckgo.com/ip3/${host}.ico`
}

export default getFaviconUrl;
