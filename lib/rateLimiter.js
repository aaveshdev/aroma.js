function rateLimiter(app, options = {}) {
    const {
        windowMs = 60000, 
        max = 100,
        message = 'Too many requests, please try again later.',
    } = options;

    const requestCounts = new Map();

    app.use((req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const now = Date.now();

        if (!requestCounts.has(ip)) {
            requestCounts.set(ip, []);
        }

        const timestamps = requestCounts.get(ip);
        const filteredTimestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);
        filteredTimestamps.push(now);
        requestCounts.set(ip, filteredTimestamps);

        if (filteredTimestamps.length > max) {
            res.writeHead(429, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: message }));
        }

        next();
    });
}

module.exports = rateLimiter;
