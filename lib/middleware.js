async function processMiddlewares(middlewares, req, res) {
    for (const middleware of middlewares) {
        await new Promise((resolve, reject) => {
            middleware(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

function matchRoute(routes, req) {
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
