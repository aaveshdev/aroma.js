function logger(app) {
    app.use((req, res, next) => {
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
        });
        next();
    });
}

module.exports = logger;
