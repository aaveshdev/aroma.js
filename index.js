const http = require('http');
const url = require('url');
const EventEmitter = require('events');
const { processMiddlewares, matchRoute, processErrorHandlers } = require('./lib/middleware');
const { serveStatic } = require('./lib/static');
const { enableTemplateEngine, render } = require('./lib/template');
const { parseCookies, manageCookies } = require('./lib/cookies');
const {manageSessions, sessions} = require('./lib/session');
const { parseJson, parseUrlEncoded } = require('./lib/bodyParser');
const rateLimiter = require('./lib/rateLimiter');
const logger = require('./lib/logger');


class Aroma extends EventEmitter {
    constructor() {
        super();
        this.routes = [];
        this.middlewares = [];
        this.errorHandlers = [];
        this.settings = {};

    }

    set(setting, value) {
        this.settings[setting] = value;
    }

    get(setting) {
        return this.settings[setting];
    }

   use(path, middleware) {
    if (typeof path === 'string' && (middleware instanceof Aroma)) {
        this.middlewares.push(async (req, res, next) => {
            const originalPath = req.path;
            if (req.path.startsWith(path)) {
                req.path = req.path.slice(path.length) || '/';
                await processMiddlewares(middleware.middlewares, req, res, middleware.routes);
                const route = matchRoute(middleware.routes, req);
                if (route) {
                    await route.handler(req, res);
                } else {
                    next();
                }
            } else {
                next();
            }

            req.path = originalPath;
        });
    } else if (typeof path === 'function') {
        this.middlewares.push(path);
    } else {
        throw new Error('Invalid middleware or path');
    }
}
    route(method, path, handler) {
        const paramRegex = /:([^/]+)/g;
        const paramNames = [];
        const regexPath = path.replace(paramRegex, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        this.routes.push({
            method,
            path: new RegExp(`^${regexPath}$`),
            handler,
            paramNames,
        });
    }

    get(path, handler) {
        this.route('GET', path, handler);
    }

    post(path, handler) {
        this.route('POST', path, handler);
    }

    put(path, handler) {
        this.route('PUT', path, handler);
    }

    delete(path, handler) {
        this.route('DELETE', path, handler);
    }

    all(path, handler) {
        this.route('*', path, handler);
    }

    serveStatic(staticPath) {
        serveStatic(this, staticPath);
    }

    enableTemplateEngine(engine) {
        enableTemplateEngine(this, engine);
    }

    useSessions() {
        parseCookies(this);
        manageSessions(this);
    }

    useCookies() {
        parseCookies(this);
    }

    manageCookies(res, name, value, options = {}) {
        manageCookies(res, name, value, options);
    }

    parseJson(){
        parseJson(this);
    }

    parseUrlEncoded(){
        parseUrlEncoded(this);
    }

    rateLimiter(options){
        rateLimiter(this, options);
    }

    logger(){
        logger(this);
    }

    render(res, view, data) {
        render(this, res, view, data);
    }

    handleErrors(handler) {
        this.errorHandlers.push(handler);
    }

      listen(port, callback) {
    const server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        req.query = parsedUrl.query;
        req.path = parsedUrl.pathname;

        res.statusCode = 200;

        res.status = function (statusCode) {
            this.statusCode = statusCode;
            return this;
        };

         res.json = function (data) {
            if (this.headersSent) {
                return; 
            }

            if (!this.statusCode) this.statusCode = 200;
            this.setHeader('Content-Type', 'application/json');
            this.end(JSON.stringify(data));
        };

        res.send = function (data) {
            if (!this.statusCode) this.statusCode = 200;
            if (typeof data === 'object') {
                this.setHeader('Content-Type', 'application/json');
                this.end(JSON.stringify(data));
            } else {
                this.end(data);
            }
        };

        try {
            await processMiddlewares(this.middlewares, req, res, this.routes);

            const route = matchRoute(this.routes, req);
            if (route) {
                await route.handler(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
        } catch (err) {
            await processErrorHandlers(this.errorHandlers, err, req, res);
        }
    });
     

    server.listen(port, callback);
}

} 

module.exports = Aroma;
