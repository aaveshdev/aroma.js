function parseJson(app) {
    app.use((req, res, next) => {
          if (req.headers['content-type']?.includes('application/json')) {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                if (body) {
                    try {
                        req.body = JSON.parse(body);
                    } catch (err) {
                        req.body = {};
                        return next(new Error('Invalid JSON format'));
                    }
                } else {
                    req.body = {};
                }
                next();
            });
        } else {
            req.body = {};
            next();
        }
    });
}

function parseUrlEncoded(app) {
         app.use((req, res, next) => {
           if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                req.body = body
                    ? Object.fromEntries(
                          body.split('&').map((pair) => pair.split('=').map(decodeURIComponent))
                      )
                    : {};
                next();
            });
        } else {
            next();
        }
        });
    
}

module.exports = { parseJson, parseUrlEncoded };
