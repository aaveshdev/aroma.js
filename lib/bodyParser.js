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
                try {
                    req.body = JSON.parse(body);
                    next();
                } catch (err) {
                    next(err);
                }
            });
        } else {
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
