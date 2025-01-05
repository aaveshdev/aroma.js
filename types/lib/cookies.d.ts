export function parseCookies(app: any): void;
/**
 * Function to set cookies in the response.
 * @param {object} res - The HTTP response object.
 * @param {string} name - Name of the cookie.
 * @param {string} value - Value of the cookie.
 * @param {object} options - Options for the cookie (e.g., maxAge, path, secure, httpOnly).
 */
export function manageCookies(res: object, name: string, value: string, options?: object): void;
