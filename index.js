const http = require('http');
const EventEmitter = require('events');
const fastQuerystring = require('fast-querystring');
const { processMiddlewares, matchRoute, processErrorHandlers } = require('./lib/middleware');
const { serveStatic } = require('./lib/static');
const { enableTemplateEngine, render } = require('./lib/template');
const { parseCookies, manageCookies } = require('./lib/cookies');
const { manageSessions, sessions } = require('./lib/session');
const { parseBody } = require('./lib/bodyParser');
const rateLimiter = require('./lib/rateLimiter');
const logger = require('./lib/logger');
const { version } = require('./package.json');
const path = require('path');
const fs = require('fs');

class Router {
    constructor() {
        this.routes = [];
        this.middlewares = [];
    }

    use(path, middleware) {
        if (typeof path === 'string' && middleware instanceof Router) {
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

    route(method, path, ...handlers) {
        const paramRegex = /:([^/]+)/g;
        const paramNames = [];
        const regexPath = path.replace(paramRegex, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const isWildcard = path.endsWith('*');
        const finalRegexPath = isWildcard
            ? regexPath.slice(0, -1) + '.*'
            : `^${regexPath}$`;

        this.routes.push({
            method,
            path: new RegExp(isWildcard ? `^${finalRegexPath}` : finalRegexPath),
            handler: async (req, res) => {
                let index = 0;
                const next = async () => {
                    const handler = handlers[index++];
                    if (handler) await handler(req, res, next);
                };
                await next();
            },
            paramNames
        });
    }

    rateLimiter(options) {
        rateLimiter(this, options);
    }

    logger() {
        logger(this);
    }

    get(path, ...handlers) {
        this.route('GET', path, ...handlers);
    }

    post(path, ...handlers) {
        this.route('POST', path, ...handlers);
    }

    put(path, ...handlers) {
        this.route('PUT', path, ...handlers);
    }

    delete(path, ...handlers) {
        this.route('DELETE', path, ...handlers);
    }

    all(path, ...handlers) {
        this.route('*', path, ...handlers);
    }
}



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
        if (!this.middlewares.includes(middleware)) { 
            if (typeof path === 'string' && (middleware instanceof Router || middleware instanceof Aroma)) {
                this.middlewares.push(async (req, res, next) => {
                    const originalPath = req.path;
                    if (req.path.startsWith(path)) {
                        req.path = req.path.slice(path.length) || '/';
                        await processMiddlewares(middleware.middlewares, req, res, middleware.routes, true);
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
    }

    route(method, path, ...handlers) {
        const paramRegex = /:([^/]+)/g;
        const paramNames = [];
        const regexPath = path.replace(paramRegex, (_, paramName) => {
            paramNames.push(paramName);
            return '([^/]+)';
        });

        const isWildcard = path.endsWith('*');
        const finalRegexPath = isWildcard
            ? regexPath.slice(0, -1) + '.*'
            : `^${regexPath}$`;

        this.routes.push({
            method,
            path: new RegExp(isWildcard ? `^${finalRegexPath}` : finalRegexPath),
            handler: async (req, res) => {
                let index = 0;
                const next = async () => {
                    const handler = handlers[index++];
                    if (handler) await handler(req, res, next);
                };
                await next();
            },
            paramNames
        });

        
    }

    get(path, ...handlers) {
        this.route('GET', path, ...handlers);
    }

    post(path, ...handlers) {
        this.route('POST', path, ...handlers);
    }

    put(path, ...handlers) {
        this.route('PUT', path, ...handlers);
    }

    delete(path, ...handlers) {
        this.route('DELETE', path, ...handlers);
    }

    all(path, ...handlers) {
        this.route('*', path, ...handlers);
    }

    metrics(path = '/metrics') {
        let requestCount = 0;

        this.use((req, res, next) => {
            requestCount++;
            next();
        });

        this.get(path, (req, res) => {
            res.json({
                status: 'ok',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                requests: requestCount,
                timestamp: new Date()
            });
        });
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

    parseBody() {
        parseBody(this);
    }

    rateLimiter(options) {
        rateLimiter(this, options);
    }

    logger() {
        logger(this);
    }

    render(res, view, data) {
        render(this, res, view, data);
    }

    handleErrors(handler) {
        this.errorHandlers.push(handler);
    }

    mount(dirPath) {
        const fullPath = path.resolve(process.cwd(), dirPath);

        const load = (folder) => {
            fs.readdirSync(folder).forEach((file) => {
                const filePath = path.join(folder, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    load(filePath);
                } else if (file.endsWith(".js") || file.endsWith(".ts")) {
                    const route = require(filePath);
                    if (typeof route === "function") {
                        route(this);
                    }
                }
            });
        };

        load(fullPath);
    }



    listen(port, callback) {
        const server = http.createServer(async (req, res) => {
            const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
            req.query = fastQuerystring.parse(parsedUrl.search.slice(1)); 
            req.path = parsedUrl.pathname;

            res.statusCode = 200;

            if (this.settings['x-powered-by'] !== false) {
                res.setHeader('X-Powered-By', `Aroma.js/${version}`);
            }W

            res.status = function (statusCode) {
                this.statusCode = statusCode;
                return this;
            };

            res.json = function (data) {
                if (this.writableEnded) return;
                this.writeHead(this.statusCode || 200, { 'Content-Type': 'application/json' });
                this.end(JSON.stringify(data, null, 0)); 
            };



            res.send = function (data) {
                if (this.writableEnded) return;
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
                     if (!res.writableEnded) {
                    await route.handler(req, res);
                }
                } else {

                    if (!res.writableEnded) {
                        if (this.settings['404']) {
                            return this.settings['404'](req, res);
                        }
                        res.end('404 Not Found');
                    }
                }
            } catch (err) {
                    await processErrorHandlers(this.errorHandlers, err, req, res);
            }
        });

        server.listen(port, callback);
    }
}



module.exports = Aroma;
module.exports.Router = Router; 