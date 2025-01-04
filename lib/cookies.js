
function parseCookies(app) {
    app.use((req, res, next) => {
        req.cookies = {};
        const cookieHeader = req.headers['cookie'];
        if (cookieHeader) {
            cookieHeader.split(';').forEach(cookie => {
                const [key, value] = cookie.split('=');
                req.cookies[key.trim()] = decodeURIComponent(value);
            });
        }
        next();
    });
}

/**
 * Function to set cookies in the response.
 * @param {object} res - The HTTP response object.
 * @param {string} name - Name of the cookie.
 * @param {string} value - Value of the cookie.
 * @param {object} options - Options for the cookie (e.g., maxAge, path, secure, httpOnly).
 */
function manageCookies(res, name, value, options = {}) {
    const cookieParts = [`${name}=${encodeURIComponent(value)}`];
    if (options.maxAge) cookieParts.push(`Max-Age=${options.maxAge}`);
    if (options.domain) cookieParts.push(`Domain=${options.domain}`);
    if (options.path) cookieParts.push(`Path=${options.path}`);
    if (options.secure) cookieParts.push(`Secure`);
    if (options.httpOnly) cookieParts.push(`HttpOnly`);
    res.setHeader('Set-Cookie', cookieParts.join('; '));
}

module.exports = { parseCookies, manageCookies };
