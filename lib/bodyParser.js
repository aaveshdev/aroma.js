function parseJson(app) {
    app.use((req, res, next) => {
        if (req.body) {
            return next();
        }

        if (req.headers['content-type']?.includes('application/json')) {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk;
            });
            req.on('end', () => {
                  if (!body || body == "") {
                    req.body = {};
                    return next();
                }
                try {
                    req.body = JSON.parse(body);
                    next();
                } catch (err) {
                    next(err);
                }
            });
        } else {
            req.body = {};
            next();
        }
    });
}


function parseUrlEncoded(app) {
    app.use((req, res, next) => {
        req.body = {}; 

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

            req.on('error', (err) => {
                console.error('Error parsing form data:', err);
                res.statusCode = 400;
                res.end('Invalid form data');
            });
        } else {
            next(); 
        }
    });
}

module.exports = { parseJson, parseUrlEncoded };
