const fs = require('fs');
const path = require('path');

function serveStatic(app, staticPath) {
    app.use((req, res, next) => {
        const filePath = path.join(staticPath, req.path);

        fs.stat(filePath, (err, stats) => {
            if (err || !stats.isFile()) {
                next();
            } else {
                const stream = fs.createReadStream(filePath);
                res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
                stream.pipe(res);
            }
        });
    });
}

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.txt': 'text/plain',
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = { serveStatic };
