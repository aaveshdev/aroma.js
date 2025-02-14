async function processMiddlewares(middlewares, req, res, routes) {
    for (const middleware of middlewares) {
        await new Promise((resolve, reject) => {
            if (typeof middleware === 'function') {
                middleware(req, res, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                middleware(req, res, resolve).catch(reject);
            }
        });
    }

    if (!Array.isArray(routes)) {
        throw new TypeError('routes must be an array');
    }

    const route = matchRoute(routes, req);
    if (route) {
        await route.handler(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
}

function matchRoute(routes, req) {
    if (!Array.isArray(routes)) {
        throw new TypeError('routes must be an array');
    }

    for (const route of routes) {
        const match = req.path.match(route.path);
        if (match && (route.method === req.method || route.method === '*')) {
            req.params = {};
            route.paramNames.forEach((name, i) => {
                req.params[name] = match[i + 1];
            });
            return route;
        }
    }
    return null;
}

async function processErrorHandlers(errorHandlers, err, req, res) {
    for (const handler of errorHandlers) {
        await new Promise((resolve) => {
            handler(err, req, res, resolve);
        });
    }
}

module.exports = { processMiddlewares, matchRoute, processErrorHandlers };