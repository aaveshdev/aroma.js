const querystring = require('querystring');

function parseBody(app) {
    app.use((req, res, next) => {
          if (req.body) {
            return next();
        }

        let body = '';

        req.on('data', (chunk) => {

            body += chunk.toString();
        });

        req.on('end', () => {
              if (!body || body == "") {
                    req.body = {};
                    return next();
                }
            const contentType = req.headers['content-type'] || '';
            try {
                if (contentType.includes('application/json')) {
                    req.body = body ? JSON.parse(body) : {};
                } else if (contentType.includes('application/x-www-form-urlencoded')) {
                    req.body = querystring.parse(body);
                } else {
                    req.body = body; 
                }
               next(); 
            } catch (err) {
                res.statusCode = 400;
                res.end('Invalid body');
            }
        });

        req.on('error', (err) => {
            res.statusCode = 400;
            res.end('Error reading body');
        });
    });
}

module.exports = { parseBody };
